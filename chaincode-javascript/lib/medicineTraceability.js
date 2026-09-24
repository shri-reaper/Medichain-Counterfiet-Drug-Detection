'use strict';

const stringify = require('json-stringify-deterministic');
const sortKeysRecursive = require('sort-keys-recursive');
const { Contract } = require('fabric-contract-api');

function timestamp(ctx) {
    if (ctx?.stub?.getDateTimestamp) {
        try { return ctx.stub.getDateTimestamp().toISOString(); } catch (_) { /* fall through */ }
    }
    if (ctx?.stub?.getTxTimestamp) {
        const tx = ctx.stub.getTxTimestamp();
        const seconds = tx.seconds?.low ?? Number(tx.seconds);
        return new Date((seconds * 1000) + Math.round((tx.nanos || 0) / 1e6)).toISOString();
    }
    return new Date().toISOString();
}

function put(ctx, key, value) {
    return ctx.stub.putState(key, Buffer.from(stringify(sortKeysRecursive(value))));
}

function requireText(value, field) {
    if (!value || String(value).trim() === '') throw new Error(`${field} is required`);
    return String(value).trim();
}

class MedicineTraceability extends Contract {
    async CreateMedicine(ctx, medicineId, medicineName, manufacturer, batchNumber, expiryDate, manufacturingLocation, quantity, verificationCode) {
        const id = requireText(medicineId, 'Medicine ID');
        const name = requireText(medicineName, 'Medicine name');
        const maker = requireText(manufacturer, 'Manufacturer');
        const batch = requireText(batchNumber, 'Batch number');
        const expiry = requireText(expiryDate, 'Expiry date');
        const location = requireText(manufacturingLocation, 'Manufacturing location');
        const code = requireText(verificationCode, 'Verification code');
        const parsedQuantity = Number(quantity);
        if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) throw new Error('Quantity must be a positive number');
        if (await this.MedicineExists(ctx, id)) throw new Error(`Medicine ${id} already exists`);

        const now = timestamp(ctx);
        const medicine = {
            medicineId: id,
            medicineName: name,
            manufacturer: maker,
            batchNumber: batch,
            expiryDate: expiry,
            manufacturingLocation: location,
            quantity: parsedQuantity,
            verificationCode: code,
            status: 'ACTIVE',
            authenticityStatus: 'UNVERIFIED',
            currentCustodian: maker,
            currentRole: 'MANUFACTURER',
            custodyHistory: [{ from: 'ORIGIN', to: maker, role: 'MANUFACTURER', timestamp: now }],
            verificationHistory: [],
            recallHistory: [],
            createdAt: now,
            lastUpdatedAt: now
        };
        await put(ctx, id, medicine);
        return JSON.stringify(medicine);
    }

    async VerifyMedicine(ctx, medicineId, scannedCode, verifier, location) {
        const id = requireText(medicineId, 'Medicine ID');
        const code = requireText(scannedCode, 'Scanned verification code');
        const verifierName = requireText(verifier, 'Verifier');
        const medicine = await this._read(ctx, id);
        const result = code === medicine.verificationCode && medicine.status !== 'RECALLED';
        const event = {
            scannedCode: code,
            verifier: verifierName,
            location: String(location || 'UNKNOWN').trim(),
            result: result ? 'GENUINE' : 'COUNTERFEIT_OR_RECALLED',
            timestamp: timestamp(ctx)
        };
        medicine.verificationHistory = Array.isArray(medicine.verificationHistory) ? medicine.verificationHistory : [];
        medicine.verificationHistory.push(event);
        medicine.authenticityStatus = result ? 'GENUINE' : 'COUNTERFEIT_OR_RECALLED';
        medicine.lastUpdatedAt = event.timestamp;
        await put(ctx, id, medicine);
        return JSON.stringify({ ...event, medicineId: id, medicine });
    }

    async TransferMedicine(ctx, medicineId, newCustodian, newRole) {
        const medicine = await this._read(ctx, requireText(medicineId, 'Medicine ID'));
        const custodian = requireText(newCustodian, 'New custodian');
        const role = requireText(newRole, 'New role').toUpperCase();
        const allowed = ['MANUFACTURER', 'WHOLESALER', 'DISTRIBUTOR', 'PHARMACY', 'HOSPITAL', 'REGULATOR'];
        if (!allowed.includes(role)) throw new Error(`Invalid role. Valid roles: ${allowed.join(', ')}`);
        const event = { from: medicine.currentCustodian, to: custodian, role, timestamp: timestamp(ctx) };
        medicine.currentCustodian = custodian;
        medicine.currentRole = role;
        medicine.custodyHistory = Array.isArray(medicine.custodyHistory) ? medicine.custodyHistory : [];
        medicine.custodyHistory.push(event);
        medicine.lastUpdatedAt = event.timestamp;
        await put(ctx, medicine.medicineId, medicine);
        return JSON.stringify(medicine);
    }

    async RecallMedicine(ctx, medicineId, reason, recalledBy) {
        const medicine = await this._read(ctx, requireText(medicineId, 'Medicine ID'));
        const recallReason = requireText(reason, 'Recall reason');
        const actor = requireText(recalledBy, 'Recalled by');
        const event = { reason: recallReason, recalledBy: actor, timestamp: timestamp(ctx) };
        medicine.status = 'RECALLED';
        medicine.authenticityStatus = 'RECALLED';
        medicine.recallHistory = Array.isArray(medicine.recallHistory) ? medicine.recallHistory : [];
        medicine.recallHistory.push(event);
        medicine.lastUpdatedAt = event.timestamp;
        await put(ctx, medicine.medicineId, medicine);
        return JSON.stringify(medicine);
    }

    async ReadMedicine(ctx, medicineId) { return JSON.stringify(await this._read(ctx, requireText(medicineId, 'Medicine ID'))); }
    async GetVerificationHistory(ctx, medicineId) { const m = await this._read(ctx, requireText(medicineId, 'Medicine ID')); return JSON.stringify(m.verificationHistory || []); }
    async GetCustodyHistory(ctx, medicineId) { const m = await this._read(ctx, requireText(medicineId, 'Medicine ID')); return JSON.stringify(m.custodyHistory || []); }

    async MedicineExists(ctx, medicineId) {
        const state = await ctx.stub.getState(medicineId);
        return Boolean(state && state.length);
    }

    async GetAllMedicines(ctx) {
        const results = [];
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            try { results.push(JSON.parse(result.value.value.toString())); } catch (_) { /* ignore non-json state */ }
            result = await iterator.next();
        }
        return JSON.stringify(results);
    }

    async _read(ctx, id) {
        const state = await ctx.stub.getState(id);
        if (!state || state.length === 0) throw new Error(`Medicine ${id} does not exist`);
        return JSON.parse(state.toString());
    }
}

module.exports = MedicineTraceability;

// Exported for lightweight unit tests without a Fabric network.
module.exports.timestamp = timestamp;
module.exports.requireText = requireText;
