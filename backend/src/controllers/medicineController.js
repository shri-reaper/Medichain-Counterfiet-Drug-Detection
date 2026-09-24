'use strict';
const { TextDecoder } = require('node:util');
const { getContract } = require('../fabric/gateway');
const decoder = new TextDecoder();
const parse = (bytes) => { const text = decoder.decode(bytes); try { return JSON.parse(text); } catch (_) { return text; } };
const text = (value) => String(value ?? '').trim();

async function submit(res, next, method, args, status = 200) {
    try { const result = await getContract().submitTransaction(method, ...args.map(text)); return res.status(status).json(parse(result)); } catch (error) { return next(error); }
}
async function evaluate(res, next, method, args) {
    try { const result = await getContract().evaluateTransaction(method, ...args.map(text)); return res.status(200).json(parse(result)); } catch (error) { return next(error); }
}

async function createMedicine(req, res, next) {
    const { medicineId, medicineName, manufacturer, batchNumber, expiryDate, manufacturingLocation, quantity, verificationCode } = req.body;
    if ([medicineId, medicineName, manufacturer, batchNumber, expiryDate, manufacturingLocation, quantity, verificationCode].some((v) => v === undefined || text(v) === '')) return res.status(400).json({ error: 'medicineId, medicineName, manufacturer, batchNumber, expiryDate, manufacturingLocation, quantity, and verificationCode are required.' });
    if (!Number.isFinite(Number(quantity)) || Number(quantity) <= 0) return res.status(400).json({ error: 'Quantity must be a positive number.' });
    return submit(res, next, 'CreateMedicine', [medicineId, medicineName, manufacturer, batchNumber, expiryDate, manufacturingLocation, quantity, verificationCode], 201);
}
async function getMedicineById(req, res, next) { return evaluate(res, next, 'ReadMedicine', [req.params.medicineId]); }
async function getAllMedicines(req, res, next) { return evaluate(res, next, 'GetAllMedicines', []); }
async function verifyMedicine(req, res, next) {
    const { scannedCode, verifier, location } = req.body;
    if (!text(scannedCode) || !text(verifier)) return res.status(400).json({ error: 'scannedCode and verifier are required.' });
    return submit(res, next, 'VerifyMedicine', [req.params.medicineId, scannedCode, verifier, location || 'UNKNOWN']);
}
async function transferMedicine(req, res, next) {
    const { newCustodian, newRole } = req.body;
    if (!text(newCustodian) || !text(newRole)) return res.status(400).json({ error: 'newCustodian and newRole are required.' });
    return submit(res, next, 'TransferMedicine', [req.params.medicineId, newCustodian, newRole]);
}
async function recallMedicine(req, res, next) {
    const { reason, recalledBy } = req.body;
    if (!text(reason) || !text(recalledBy)) return res.status(400).json({ error: 'reason and recalledBy are required.' });
    return submit(res, next, 'RecallMedicine', [req.params.medicineId, reason, recalledBy]);
}
async function getVerificationHistory(req, res, next) { return evaluate(res, next, 'GetVerificationHistory', [req.params.medicineId]); }
async function getCustodyHistory(req, res, next) { return evaluate(res, next, 'GetCustodyHistory', [req.params.medicineId]); }
module.exports = { createMedicine, getMedicineById, getAllMedicines, verifyMedicine, transferMedicine, recallMedicine, getVerificationHistory, getCustodyHistory };
