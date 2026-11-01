'use strict';
const gw = require('../ethereum/gateway');

const text = (v) => String(v ?? '').trim();
const ROLES = ['MANUFACTURER', 'WHOLESALER', 'DISTRIBUTOR', 'PHARMACY', 'HOSPITAL', 'REGULATOR'];
const bad = (msg) => { const e = new Error(msg); e.statusCode = 400; return e; };

async function createMedicine(req, res, next) {
    try {
        const b = req.body || {};
        const fields = ['medicineId', 'medicineName', 'manufacturer', 'batchNumber', 'expiryDate', 'manufacturingLocation', 'quantity', 'verificationCode'];
        if (fields.some((f) => !text(b[f]))) throw bad(`${fields.join(', ')} are required.`);
        const quantity = Number(b.quantity);
        if (!Number.isInteger(quantity) || quantity <= 0) throw bad('Quantity must be a positive whole number.');
        const id = text(b.medicineId);
        const txHash = await gw.write('createMedicine', [{
            medicineId: id,
            medicineName: text(b.medicineName),
            manufacturer: text(b.manufacturer),
            batchNumber: text(b.batchNumber),
            expiryDate: text(b.expiryDate),
            manufacturingLocation: text(b.manufacturingLocation),
            quantity,
            codeHash: gw.codeHash(id, b.verificationCode),
        }]);
        const medicine = await gw.readMedicine(id);
        return res.status(201).json({ ...medicine, txHash });
    } catch (e) { return next(gw.normalizeError(e)); }
}

async function getMedicineById(req, res, next) {
    try { return res.json(await gw.readMedicine(req.params.medicineId)); } catch (e) { return next(gw.normalizeError(e)); }
}

async function getAllMedicines(req, res, next) {
    try { return res.json(await gw.getAllMedicines()); } catch (e) { return next(gw.normalizeError(e)); }
}

async function verifyMedicine(req, res, next) {
    try {
        const { scannedCode, verifier, location } = req.body || {};
        if (!text(scannedCode) || !text(verifier)) throw bad('scannedCode and verifier are required.');
        const id = text(req.params.medicineId);
        const txHash = await gw.write('verifyMedicine', [id, gw.codeHash(id, scannedCode), text(verifier), text(location) || 'UNKNOWN']);
        const medicine = await gw.readMedicine(id);
        const last = medicine.verificationHistory[medicine.verificationHistory.length - 1] || {};
        return res.json({ medicineId: id, result: last.result, verifier: last.verifier, location: last.location, timestamp: last.timestamp, txHash, medicine });
    } catch (e) { return next(gw.normalizeError(e)); }
}

async function transferMedicine(req, res, next) {
    try {
        const { newCustodian, newRole } = req.body || {};
        if (!text(newCustodian) || !text(newRole)) throw bad('newCustodian and newRole are required.');
        const role = text(newRole).toUpperCase();
        if (!ROLES.includes(role)) throw bad(`Invalid role. Valid roles: ${ROLES.join(', ')}`);
        const id = text(req.params.medicineId);
        const txHash = await gw.write('transferMedicine', [id, text(newCustodian), role]);
        return res.json({ ...(await gw.readMedicine(id)), txHash });
    } catch (e) { return next(gw.normalizeError(e)); }
}

async function recallMedicine(req, res, next) {
    try {
        const { reason, recalledBy } = req.body || {};
        if (!text(reason) || !text(recalledBy)) throw bad('reason and recalledBy are required.');
        const id = text(req.params.medicineId);
        const txHash = await gw.write('recallMedicine', [id, text(reason), text(recalledBy)]);
        return res.json({ ...(await gw.readMedicine(id)), txHash });
    } catch (e) { return next(gw.normalizeError(e)); }
}

async function getVerificationHistory(req, res, next) {
    try { return res.json((await gw.readMedicine(req.params.medicineId)).verificationHistory); } catch (e) { return next(gw.normalizeError(e)); }
}

async function getCustodyHistory(req, res, next) {
    try { return res.json((await gw.readMedicine(req.params.medicineId)).custodyHistory); } catch (e) { return next(gw.normalizeError(e)); }
}

module.exports = { createMedicine, getMedicineById, getAllMedicines, verifyMedicine, transferMedicine, recallMedicine, getVerificationHistory, getCustodyHistory };
