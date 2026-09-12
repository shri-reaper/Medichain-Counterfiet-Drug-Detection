'use strict';

const stringify = require('json-stringify-deterministic');
const sortKeysRecursive = require('sort-keys-recursive');
const { Contract } = require('fabric-contract-api');

/**
 * Deterministically format the Fabric transaction timestamp into an ISO-8601 string.
 * This guarantees exact agreement across all endorsing peers.
 */
function getDeterministicTimestamp(ctx) {
    if (ctx && ctx.stub) {
        if (typeof ctx.stub.getDateTimestamp === 'function') {
            try {
                return ctx.stub.getDateTimestamp().toISOString();
            } catch {
                // fallback to getTxTimestamp below
            }
        }
        if (typeof ctx.stub.getTxTimestamp === 'function') {
            const timestamp = ctx.stub.getTxTimestamp();
            const seconds = (timestamp.seconds && timestamp.seconds.low !== undefined)
                ? timestamp.seconds.low
                : Number(timestamp.seconds);
            const nanos = timestamp.nanos || 0;
            const milliseconds = (seconds * 1000) + Math.round(nanos / 1000000);
            return new Date(milliseconds).toISOString();
        }
    }
    return 'UNKNOWN_TIMESTAMP';
}

/**
 * Centralized Crop-Specific Storage Rules Configuration.
 * Defines strict cold-chain and post-harvest storage thresholds:
 * - Tomato: 10°C to 15°C, 85% to 95% RH (prevents chilling injury below 10°C)
 * - Rice: 15°C to 25°C, 40% to 65% RH (cool, dry grain storage)
 * - Mango: 10°C to 14°C, 85% to 90% RH (tropical cold-chain preservation)
 * - Leafy Greens: 0°C to 4°C, 90% to 98% RH (near-freezing ultra-low temp standard)
 * - Potato: 7°C to 10°C, 85% to 95% RH (cool ambient storage, prevents cold sweetening)
 */
const CROP_STORAGE_RULES = {
    'TOMATO': {
        crop: 'Tomato',
        ruleName: 'Tomato Cold-Chain Standard',
        minTemperature: 10,
        maxTemperature: 15,
        minHumidity: 85,
        maxHumidity: 95,
        minTemp: 10,
        maxTemp: 15,
        unitTemp: '°C',
        unitHumidity: '% RH',
        isFallback: false,
        description: 'Optimal storage at 10°C to 15°C with 85% to 95% RH to avoid chilling injury and weight loss.'
    },
    'RICE': {
        crop: 'Rice',
        ruleName: 'Rice & Paddy Dry-Storage Standard',
        minTemperature: 15,
        maxTemperature: 25,
        minHumidity: 40,
        maxHumidity: 65,
        minTemp: 15,
        maxTemp: 25,
        unitTemp: '°C',
        unitHumidity: '% RH',
        isFallback: false,
        description: 'Cool and low-humidity storage at 15°C to 25°C with 40% to 65% RH to inhibit pest proliferation and mold.'
    },
    'MANGO': {
        crop: 'Mango',
        ruleName: 'Tropical Mango Cold-Chain Standard',
        minTemperature: 10,
        maxTemperature: 14,
        minHumidity: 85,
        maxHumidity: 90,
        minTemp: 10,
        maxTemp: 14,
        unitTemp: '°C',
        unitHumidity: '% RH',
        isFallback: false,
        description: 'Chilling-sensitive tropical fruit maintained at 10°C to 14°C with 85% to 90% RH to regulate ripening.'
    },
    'LEAFY GREENS': {
        crop: 'Leafy Greens',
        ruleName: 'Leafy Greens Near-Freezing Standard',
        minTemperature: 0,
        maxTemperature: 4,
        minHumidity: 90,
        maxHumidity: 98,
        minTemp: 0,
        maxTemp: 4,
        unitTemp: '°C',
        unitHumidity: '% RH',
        isFallback: false,
        description: 'Near-freezing storage at 0°C to 4°C with 90% to 98% RH to halt respiration and prevent wilting.'
    },
    'POTATO': {
        crop: 'Potato',
        ruleName: 'Ware Potato Storage Standard',
        minTemperature: 7,
        maxTemperature: 10,
        minHumidity: 85,
        maxHumidity: 95,
        minTemp: 7,
        maxTemp: 10,
        unitTemp: '°C',
        unitHumidity: '% RH',
        isFallback: false,
        description: 'Controlled cold storage at 7°C to 10°C with 85% to 95% RH to stop sprouting while avoiding cold sweetening.'
    }
};

/**
 * Safe and explicit fallback rule for unconfigured or general agricultural produce.
 */
const DEFAULT_STORAGE_RULE = {
    crop: 'General Produce',
    ruleName: 'Standard Cold-Chain Baseline (Fallback)',
    minTemperature: 2,
    maxTemperature: 8,
    minHumidity: 40,
    maxHumidity: 60,
    minTemp: 2,
    maxTemp: 8,
    unitTemp: '°C',
    unitHumidity: '% RH',
    isFallback: true,
    description: 'Safe baseline cold-chain standard (2°C to 8°C, 40% to 60% RH) applied as explicit fallback for unconfigured crops.'
};

/**
 * Resolves the applicable storage rule for a crop name.
 * Handles exact key match, keyword/substring variations (e.g. "Alphonso Mango", "Organic Tomato"),
 * and returns an explicit fallback object for unknown crops.
 */
function resolveStorageRule(cropName) {
    if (!cropName || typeof cropName !== 'string' || cropName.trim() === '') {
        return {
            ...DEFAULT_STORAGE_RULE,
            requestedCrop: 'UNKNOWN',
            isFallback: true,
            note: 'No crop specified. Applied safe baseline standard.'
        };
    }

    const clean = cropName.trim().toUpperCase();

    // 1. Direct exact key match
    if (CROP_STORAGE_RULES[clean]) {
        return {
            ...CROP_STORAGE_RULES[clean],
            requestedCrop: cropName.trim()
        };
    }

    // 2. Keyword/substring matching for common varieties
    if (clean.includes('TOMATO')) {
        return {
            ...CROP_STORAGE_RULES['TOMATO'],
            requestedCrop: cropName.trim()
        };
    }
    if (clean.includes('RICE') || clean.includes('PADDY')) {
        return {
            ...CROP_STORAGE_RULES['RICE'],
            requestedCrop: cropName.trim()
        };
    }
    if (clean.includes('MANGO')) {
        return {
            ...CROP_STORAGE_RULES['MANGO'],
            requestedCrop: cropName.trim()
        };
    }
    if (
        clean.includes('LEAFY') ||
        clean.includes('SPINACH') ||
        clean.includes('LETTUCE') ||
        clean.includes('KALE') ||
        clean.includes('GREENS')
    ) {
        return {
            ...CROP_STORAGE_RULES['LEAFY GREENS'],
            requestedCrop: cropName.trim()
        };
    }
    if (clean.includes('POTATO')) {
        return {
            ...CROP_STORAGE_RULES['POTATO'],
            requestedCrop: cropName.trim()
        };
    }

    // 3. Safe and explicit fallback behavior for unconfigured crops
    return {
        ...DEFAULT_STORAGE_RULE,
        crop: cropName.trim(),
        requestedCrop: cropName.trim(),
        isFallback: true,
        note: `No dedicated rule configured for "${cropName.trim()}". Applied safe baseline standard.`
    };
}

class AssetTransfer extends Contract {

    async CreateBatch(ctx, batchId, crop, farmer, location, quantity) {
        if (!batchId || !crop || !farmer || !location || quantity === undefined) {
            throw new Error('All fields (batchId, crop, farmer, location, quantity) are required');
        }

        const exists = await this.BatchExists(ctx, batchId);

        if (exists) {
            throw new Error(`Batch ${batchId} already exists`);
        }

        const txTimestamp = getDeterministicTimestamp(ctx);
        const parsedQuantity = Number(quantity);

        const batch = {
            batchId: String(batchId).trim(),
            crop: String(crop).trim(),
            farmer: String(farmer).trim(),
            location: String(location).trim(),
            quantity: parsedQuantity,

            // Custody Information
            currentCustodian: String(farmer).trim(),
            currentRole: 'FARMER',
            custodyHistory: [
                {
                    from: 'ORIGIN',
                    to: String(farmer).trim(),
                    role: 'FARMER',
                    timestamp: txTimestamp
                }
            ],

            // Sensor storage metrics
            temperature: 0,
            humidity: 0,

            storageStatus: 'NOT_MONITORED',
            telemetryHistory: [],
            createdAt: txTimestamp
        };

        await ctx.stub.putState(
            batchId,
            Buffer.from(stringify(sortKeysRecursive(batch)))
        );

        return JSON.stringify(batch);
    }

    async TransferBatch(ctx, batchId, newCustodian, newRole) {
        if (!batchId || String(batchId).trim() === '') {
            throw new Error('Batch ID cannot be empty');
        }
        if (!newCustodian || String(newCustodian).trim() === '') {
            throw new Error('New custodian cannot be empty');
        }
        if (!newRole || String(newRole).trim() === '') {
            throw new Error('New role cannot be empty');
        }

        const batchJSON = await ctx.stub.getState(batchId);
        if (!batchJSON || batchJSON.length === 0) {
            throw new Error(`Batch ${batchId} does not exist`);
        }

        const batch = JSON.parse(batchJSON.toString());

        const previousCustodian = batch.currentCustodian || batch.farmer;
        const normalizedCustodian = String(newCustodian).trim();
        const normalizedRole = String(newRole).trim().toUpperCase();

        const txTimestamp = getDeterministicTimestamp(ctx);

        // Ensure backwards compatibility if batch was created before custody tracking
        if (!Array.isArray(batch.custodyHistory)) {
            batch.custodyHistory = [
                {
                    from: 'ORIGIN',
                    to: batch.farmer,
                    role: 'FARMER',
                    timestamp: batch.createdAt || txTimestamp
                }
            ];
        }

        // Preserve telemetry history
        if (!Array.isArray(batch.telemetryHistory)) {
            batch.telemetryHistory = [];
        }

        const custodyEvent = {
            from: previousCustodian,
            to: normalizedCustodian,
            role: normalizedRole,
            timestamp: txTimestamp
        };

        batch.currentCustodian = normalizedCustodian;
        batch.currentRole = normalizedRole;
        batch.custodyHistory.push(custodyEvent);

        await ctx.stub.putState(
            batchId,
            Buffer.from(stringify(sortKeysRecursive(batch)))
        );

        return JSON.stringify(batch);
    }

    async GetCustodyHistory(ctx, batchId) {
        if (!batchId || String(batchId).trim() === '') {
            throw new Error('Batch ID cannot be empty');
        }

        const batchJSON = await ctx.stub.getState(batchId);
        if (!batchJSON || batchJSON.length === 0) {
            throw new Error(`Batch ${batchId} does not exist`);
        }

        const batch = JSON.parse(batchJSON.toString());

        if (!Array.isArray(batch.custodyHistory)) {
            return JSON.stringify([
                {
                    from: 'ORIGIN',
                    to: batch.farmer,
                    role: 'FARMER',
                    timestamp: batch.createdAt || 'N/A'
                }
            ]);
        }

        return JSON.stringify(batch.custodyHistory);
    }

    async GetTelemetryHistory(ctx, batchId) {
        if (!batchId || String(batchId).trim() === '') {
            throw new Error('Batch ID cannot be empty');
        }

        const batchJSON = await ctx.stub.getState(batchId);
        if (!batchJSON || batchJSON.length === 0) {
            throw new Error(`Batch ${batchId} does not exist`);
        }

        const batch = JSON.parse(batchJSON.toString());

        if (!Array.isArray(batch.telemetryHistory)) {
            return JSON.stringify([]);
        }

        return JSON.stringify(batch.telemetryHistory);
    }

    /**
     * Read-only query function: GetStorageRules(ctx, crop)
     * Returns configured cold-chain storage requirements for the requested crop.
     */
    async GetStorageRules(ctx, crop) {
        if (!crop || String(crop).trim() === '') {
            return JSON.stringify({
                configuredCrops: Object.keys(CROP_STORAGE_RULES).map(k => CROP_STORAGE_RULES[k]),
                defaultFallback: DEFAULT_STORAGE_RULE
            });
        }

        const trimmed = String(crop).trim();
        if (trimmed.toUpperCase() === 'ALL') {
            return JSON.stringify({
                configuredCrops: Object.keys(CROP_STORAGE_RULES).map(k => CROP_STORAGE_RULES[k]),
                defaultFallback: DEFAULT_STORAGE_RULE
            });
        }

        const rule = resolveStorageRule(trimmed);
        return JSON.stringify(rule);
    }

    /**
     * Read-only query function: GetBatchStorageRules(ctx, batchId)
     * Determines and returns the storage rules applicable to a specific batch based on its crop.
     */
    async GetBatchStorageRules(ctx, batchId) {
        if (!batchId || String(batchId).trim() === '') {
            throw new Error('Batch ID cannot be empty');
        }

        const batchJSON = await ctx.stub.getState(batchId);
        if (!batchJSON || batchJSON.length === 0) {
            throw new Error(`Batch ${batchId} does not exist`);
        }

        const batch = JSON.parse(batchJSON.toString());
        const rule = resolveStorageRule(batch.crop);

        return JSON.stringify({
            batchId: batch.batchId,
            ...rule
        });
    }

    async ReadBatch(ctx, batchId) {
        const batchJSON = await ctx.stub.getState(batchId);

        if (!batchJSON || batchJSON.length === 0) {
            throw new Error(`Batch ${batchId} does not exist`);
        }

        const batch = JSON.parse(batchJSON.toString());

        // Backwards compatibility for existing batches
        if (!batch.currentCustodian) {
            batch.currentCustodian = batch.farmer;
        }
        if (!batch.currentRole) {
            batch.currentRole = 'FARMER';
        }
        if (!Array.isArray(batch.custodyHistory)) {
            batch.custodyHistory = [
                {
                    from: 'ORIGIN',
                    to: batch.farmer,
                    role: 'FARMER',
                    timestamp: batch.createdAt || 'N/A'
                }
            ];
        }
        if (!Array.isArray(batch.telemetryHistory)) {
            batch.telemetryHistory = [];
        }

        return JSON.stringify(batch);
    }

    async UpdateStorageConditions(ctx, batchId, temperature, humidity) {
        const batchJSON = await ctx.stub.getState(batchId);

        if (!batchJSON || batchJSON.length === 0) {
            throw new Error(`Batch ${batchId} does not exist`);
        }

        const batch = JSON.parse(batchJSON.toString());

        batch.temperature = Number(temperature);
        batch.humidity = Number(humidity);

        // Resolve crop-specific storage rule
        const rule = resolveStorageRule(batch.crop);

        // Crop-specific cold-chain storage evaluation
        const isTempSafe = batch.temperature >= rule.minTemperature && batch.temperature <= rule.maxTemperature;
        const isHumSafe = batch.humidity >= rule.minHumidity && batch.humidity <= rule.maxHumidity;

        if (isTempSafe && isHumSafe) {
            batch.storageStatus = 'SAFE';
        } else {
            batch.storageStatus = 'CONDITION_FAILED';
        }

        const txTimestamp = getDeterministicTimestamp(ctx);

        // Append to immutable telemetry history audit trail
        if (!Array.isArray(batch.telemetryHistory)) {
            batch.telemetryHistory = [];
        }

        const telemetryRecord = {
            temperature: batch.temperature,
            humidity: batch.humidity,
            storageStatus: batch.storageStatus,
            timestamp: txTimestamp,
            ruleApplied: rule.crop,
            isFallbackRule: Boolean(rule.isFallback)
        };
        batch.telemetryHistory.push(telemetryRecord);

        // Preserve custody information
        if (!batch.currentCustodian) {
            batch.currentCustodian = batch.farmer;
        }
        if (!batch.currentRole) {
            batch.currentRole = 'FARMER';
        }
        if (!Array.isArray(batch.custodyHistory)) {
            batch.custodyHistory = [
                {
                    from: 'ORIGIN',
                    to: batch.farmer,
                    role: 'FARMER',
                    timestamp: batch.createdAt || 'N/A'
                }
            ];
        }

        await ctx.stub.putState(
            batchId,
            Buffer.from(stringify(sortKeysRecursive(batch)))
        );

        return JSON.stringify(batch);
    }

    async BatchExists(ctx, batchId) {
        const batchJSON = await ctx.stub.getState(batchId);
        return batchJSON && batchJSON.length > 0;
    }

    async GetAllBatches(ctx) {
        const results = [];
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();

        while (!result.done) {
            const value = result.value.value.toString();
            try {
                const batch = JSON.parse(value);
                if (batch && typeof batch === 'object') {
                    if (!batch.currentCustodian) {
                        batch.currentCustodian = batch.farmer;
                    }
                    if (!batch.currentRole) {
                        batch.currentRole = 'FARMER';
                    }
                    if (!Array.isArray(batch.custodyHistory)) {
                        batch.custodyHistory = [
                            {
                                from: 'ORIGIN',
                                to: batch.farmer,
                                role: 'FARMER',
                                timestamp: batch.createdAt || 'N/A'
                            }
                        ];
                    }
                    if (!Array.isArray(batch.telemetryHistory)) {
                        batch.telemetryHistory = [];
                    }
                }
                results.push(batch);
            } catch (error) {
                results.push(value);
            }
            result = await iterator.next();
        }

        return JSON.stringify(results);
    }

}

module.exports = AssetTransfer;

