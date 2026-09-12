'use strict';

const grpc = require('@grpc/grpc-js');
const { connect, hash, signers } = require('@hyperledger/fabric-gateway');
const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const config = require('../config/fabric.config');

let client = null;
let gateway = null;
let network = null;
let contract = null;

/**
 * Get the first non-hidden file name in a directory.
 */
async function getFirstDirFileName(dirPath) {
    const files = await fs.readdir(dirPath);
    const validFile = files.find((f) => !f.startsWith('.'));
    if (!validFile) {
        throw new Error(`No certificate or key files found in directory: ${dirPath}`);
    }
    return path.join(dirPath, validFile);
}

/**
 * Create a new gRPC connection to the Fabric peer.
 */
async function newGrpcConnection() {
    const tlsRootCert = await fs.readFile(config.tlsCertPath);
    const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
    return new grpc.Client(config.peerEndpoint, tlsCredentials, {
        'grpc.ssl_target_name_override': config.peerHostAlias,
    });
}

/**
 * Create a new identity using the Org1 Admin certificate.
 */
async function newIdentity() {
    const certPath = await getFirstDirFileName(config.certDirectoryPath);
    const credentials = await fs.readFile(certPath);
    return {
        mspId: config.mspId,
        credentials: credentials,
    };
}

/**
 * Create a new signer using the Org1 Admin private key.
 */
async function newSigner() {
    const keyPath = await getFirstDirFileName(config.keyDirectoryPath);
    const privateKeyPem = await fs.readFile(keyPath);
    const privateKey = crypto.createPrivateKey(privateKeyPem);
    return signers.newPrivateKeySigner(privateKey);
}

/**
 * Initialize Fabric Gateway and get smart contract instance.
 */
async function initializeGateway() {
    if (contract) {
        return contract;
    }

    console.log('Connecting to Fabric Gateway...');
    console.log(`  Peer Endpoint: ${config.peerEndpoint}`);
    console.log(`  Peer Host Alias: ${config.peerHostAlias}`);
    console.log(`  Channel Name: ${config.channelName}`);
    console.log(`  Chaincode Name: ${config.chaincodeName}`);
    console.log(`  MSP ID: ${config.mspId}`);

    client = await newGrpcConnection();

    gateway = connect({
        client,
        identity: await newIdentity(),
        signer: await newSigner(),
        hash: hash.sha256,
        evaluateOptions: () => ({ deadline: Date.now() + 5000 }),     // 5 seconds
        endorseOptions: () => ({ deadline: Date.now() + 15000 }),     // 15 seconds
        submitOptions: () => ({ deadline: Date.now() + 5000 }),       // 5 seconds
        commitStatusOptions: () => ({ deadline: Date.now() + 60000 }), // 1 minute
    });

    network = gateway.getNetwork(config.channelName);
    contract = network.getContract(config.chaincodeName);

    console.log('Connected to Hyperledger Fabric successfully.');
    return contract;
}

/**
 * Get the initialized contract instance.
 */
function getContract() {
    if (!contract) {
        throw new Error('Fabric Gateway is not initialized. Please call initializeGateway() first.');
    }
    return contract;
}

/**
 * Gracefully close the Gateway and gRPC client connection.
 */
async function closeGateway() {
    console.log('Closing Fabric Gateway connection...');
    if (gateway) {
        gateway.close();
        gateway = null;
    }
    if (client) {
        client.close();
        client = null;
    }
    contract = null;
    network = null;
    console.log('Fabric Gateway connection closed.');
}

module.exports = {
    initializeGateway,
    getContract,
    closeGateway,
};
