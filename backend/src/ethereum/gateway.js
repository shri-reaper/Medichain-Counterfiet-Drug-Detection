'use strict';

const { ethers } = require('ethers');
const config = require('../config/chain.config');

const TUPLE_MEDICINE =
    'tuple(string medicineId,string medicineName,string manufacturer,string batchNumber,string expiryDate,string manufacturingLocation,uint256 quantity,bytes32 codeHash,string status,string authenticityStatus,string currentCustodian,string currentRole,' +
    'tuple(string from,string to,string role,uint256 timestamp)[] custodyHistory,' +
    'tuple(bytes32 scannedCodeHash,string verifier,string location,string result,uint256 timestamp)[] verificationHistory,' +
    'tuple(string reason,string recalledBy,uint256 timestamp)[] recallHistory,' +
    'uint256 createdAt,uint256 lastUpdatedAt)';

const ABI = [
    'function createMedicine(tuple(string medicineId,string medicineName,string manufacturer,string batchNumber,string expiryDate,string manufacturingLocation,uint256 quantity,bytes32 codeHash) p)',
    'function verifyMedicine(string medicineId,bytes32 scannedCodeHash,string verifier,string location)',
    'function transferMedicine(string medicineId,string newCustodian,string newRole)',
    'function recallMedicine(string medicineId,string reason,string recalledBy)',
    'function medicineCount() view returns (uint256)',
    'function medicineIdAt(uint256 index) view returns (string)',
    `function readMedicine(string medicineId) view returns (${TUPLE_MEDICINE})`,
    'function owner() view returns (address)',
    'function operator() view returns (address)',
];

let provider = null;
let wallet = null;
let contract = null;
let readContract = null;

function missingConfig() {
    const missing = [];
    if (!config.contractAddress) missing.push('CONTRACT_ADDRESS');
    if (!config.privateKey) missing.push('PRIVATE_KEY');
    if (!config.codePepper) missing.push('CODE_PEPPER');
    return missing;
}

function isConfigured() {
    return missingConfig().length === 0;
}

function init() {
    if (contract) return contract;
    const missing = missingConfig();
    if (missing.length) {
        const err = new Error(`Backend is not configured. Missing environment variables: ${missing.join(', ')}`);
        err.statusCode = 503;
        throw err;
    }
    provider = new ethers.JsonRpcProvider(config.rpcUrl, config.chainId, { staticNetwork: true });
    wallet = new ethers.Wallet(config.privateKey, provider);
    contract = new ethers.Contract(config.contractAddress, ABI, wallet);
    readContract = new ethers.Contract(config.contractAddress, ABI, provider);
    return contract;
}

function getContract() { init(); return contract; }
function getReadContract() { init(); return readContract; }
function getWallet() { init(); return wallet; }
function getProvider() { init(); return provider; }

/** HMAC of (medicineId + code) with a server-side pepper, so on-chain hashes can't be brute-forced offline. */
function codeHash(medicineId, code) {
    const key = ethers.toUtf8Bytes(config.codePepper);
    const msg = ethers.toUtf8Bytes(`${String(medicineId).trim()}\n${String(code).trim()}`);
    return ethers.computeHmac('sha256', key, msg);
}

function normalizeError(e) {
    if (e && e.statusCode) return e;
    let message = e?.reason || e?.revert?.args?.[0] || '';
    if (!message) {
        if (e?.code === 'INSUFFICIENT_FUNDS') message = 'The backend wallet is out of Sepolia ETH. Top it up from a Sepolia faucet.';
        else message = e?.shortMessage || e?.message || 'Unexpected blockchain error';
    }
    const err = new Error(message);
    if (e?.code === 'INSUFFICIENT_FUNDS') err.statusCode = 503;
    else if (/does not exist/.test(message)) err.statusCode = 404;
    else if (/already exists|already in use|already registered|already recalled/.test(message)) err.statusCode = 409;
    else if (/required|must be|Invalid role|blocked/.test(message)) err.statusCode = 400;
    return err;
}

// Writes are sent one at a time so the wallet nonce never collides.
let queue = Promise.resolve();
function enqueue(task) {
    const run = queue.then(task);
    queue = run.catch(() => {});
    return run;
}

async function write(method, args) {
    return enqueue(async () => {
        try {
            const tx = await getContract()[method](...args);
            const receipt = await tx.wait();
            if (!receipt || receipt.status !== 1) throw new Error('Transaction failed on-chain');
            invalidateCache();
            return receipt.hash;
        } catch (e) {
            throw normalizeError(e);
        }
    });
}

const iso = (ts) => new Date(Number(ts) * 1000).toISOString();

function toMedicine(r) {
    return {
        medicineId: r.medicineId,
        medicineName: r.medicineName,
        manufacturer: r.manufacturer,
        batchNumber: r.batchNumber,
        expiryDate: r.expiryDate,
        manufacturingLocation: r.manufacturingLocation,
        quantity: Number(r.quantity),
        status: r.status,
        authenticityStatus: r.authenticityStatus,
        currentCustodian: r.currentCustodian,
        currentRole: r.currentRole,
        custodyHistory: r.custodyHistory.map((c) => ({ from: c.from, to: c.to, role: c.role, timestamp: iso(c.timestamp) })),
        verificationHistory: r.verificationHistory.map((v) => ({
            scannedCodeHash: v.scannedCodeHash, verifier: v.verifier, location: v.location, result: v.result, timestamp: iso(v.timestamp),
        })),
        recallHistory: r.recallHistory.map((x) => ({ reason: x.reason, recalledBy: x.recalledBy, timestamp: iso(x.timestamp) })),
        createdAt: iso(r.createdAt),
        lastUpdatedAt: iso(r.lastUpdatedAt),
    };
}

async function read(fn) {
    try { return await fn(getReadContract()); } catch (e) { throw normalizeError(e); }
}

async function readMedicine(id) {
    return read(async (c) => toMedicine(await c.readMedicine(String(id).trim())));
}

let listCache = null;
let listCacheAt = 0;
function invalidateCache() { listCache = null; }

async function getAllMedicines() {
    if (listCache && Date.now() - listCacheAt < 5000) return listCache;
    const list = await read(async (c) => {
        const count = Number(await c.medicineCount());
        const out = [];
        for (let i = 0; i < count; i += 8) {
            const batch = [];
            for (let j = i; j < Math.min(i + 8, count); j++) {
                batch.push(c.medicineIdAt(j).then((id) => c.readMedicine(id)).then(toMedicine));
            }
            out.push(...(await Promise.all(batch)));
        }
        return out;
    });
    listCache = list;
    listCacheAt = Date.now();
    return list;
}

module.exports = { isConfigured, missingConfig, getWallet, getProvider, codeHash, write, readMedicine, getAllMedicines, normalizeError, config };
