'use strict';

const { TextDecoder } = require('node:util');
const { getContract } = require('../fabric/gateway');

const utf8Decoder = new TextDecoder();

/**
 * Helper to parse Fabric transaction byte result into JSON.
 */
function parseResult(resultBytes) {
    const resultString = utf8Decoder.decode(resultBytes);
    if (!resultString) {
        return null;
    }
    try {
        return JSON.parse(resultString);
    } catch {
        return resultString;
    }
}

/**
 * POST /api/batches
 * Create a new batch on the blockchain.
 */
async function createBatch(req, res, next) {
    try {
        const { batchId, crop, farmer, location, quantity } = req.body;

        // Input validation
        if (!batchId || !crop || !farmer || !location || quantity === undefined) {
            return res.status(400).json({
                error: 'Missing required fields: batchId, crop, farmer, location, and quantity are required.',
            });
        }

        const parsedQuantity = Number(quantity);
        if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
            return res.status(400).json({
                error: 'Quantity must be a positive number.',
            });
        }

        const contract = getContract();
        const resultBytes = await contract.submitTransaction(
            'CreateBatch',
            String(batchId).trim(),
            String(crop).trim(),
            String(farmer).trim(),
            String(location).trim(),
            String(parsedQuantity)
        );

        const newBatch = parseResult(resultBytes);
        return res.status(201).json(newBatch);
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/batches/:batchId
 * Read a specific batch from the blockchain.
 */
async function getBatchById(req, res, next) {
    try {
        const { batchId } = req.params;

        if (!batchId) {
            return res.status(400).json({
                error: 'Batch ID is required.',
            });
        }

        const contract = getContract();
        const resultBytes = await contract.evaluateTransaction('ReadBatch', String(batchId).trim());
        const batch = parseResult(resultBytes);

        return res.status(200).json(batch);
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/batches
 * Retrieve all batches stored on the blockchain.
 */
async function getAllBatches(req, res, next) {
    try {
        const contract = getContract();
        const resultBytes = await contract.evaluateTransaction('GetAllBatches');
        const batches = parseResult(resultBytes);

        return res.status(200).json(batches || []);
    } catch (error) {
        next(error);
    }
}

/**
 * PUT /api/batches/:batchId/storage
 * Update storage conditions (temperature, humidity) for a batch.
 */
async function updateStorageConditions(req, res, next) {
    try {
        const { batchId } = req.params;
        const { temperature, humidity } = req.body;

        if (!batchId) {
            return res.status(400).json({
                error: 'Batch ID is required.',
            });
        }

        if (temperature === undefined || humidity === undefined) {
            return res.status(400).json({
                error: 'Missing required fields: temperature and humidity are required.',
            });
        }

        const parsedTemp = Number(temperature);
        const parsedHumidity = Number(humidity);

        if (isNaN(parsedTemp) || isNaN(parsedHumidity)) {
            return res.status(400).json({
                error: 'Temperature and humidity must be valid numbers.',
            });
        }

        const contract = getContract();
        const resultBytes = await contract.submitTransaction(
            'UpdateStorageConditions',
            String(batchId).trim(),
            String(parsedTemp),
            String(parsedHumidity)
        );

        const updatedBatch = parseResult(resultBytes);
        return res.status(200).json(updatedBatch);
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/batches/:batchId/transfer
 * Transfer batch custody to a new custodian and role.
 */
async function transferBatch(req, res, next) {
    try {
        const { batchId } = req.params;
        const { newCustodian, newRole } = req.body;

        if (!batchId) {
            return res.status(400).json({
                error: 'Batch ID is required.',
            });
        }

        if (!newCustodian || !newRole) {
            return res.status(400).json({
                error: 'Missing required fields: newCustodian and newRole are required.',
            });
        }

        const validRoles = ['FARMER', 'TRANSPORTER', 'DISTRIBUTOR', 'RETAILER'];
        const normalizedRole = String(newRole).trim().toUpperCase();

        if (!validRoles.includes(normalizedRole)) {
            return res.status(400).json({
                error: `Invalid role "${newRole}". Valid roles are: ${validRoles.join(', ')}`,
            });
        }

        const contract = getContract();
        const resultBytes = await contract.submitTransaction(
            'TransferBatch',
            String(batchId).trim(),
            String(newCustodian).trim(),
            normalizedRole
        );

        const updatedBatch = parseResult(resultBytes);
        return res.status(200).json(updatedBatch);
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/batches/:batchId/custody-history
 * Retrieve custody movement history for a batch.
 */
async function getCustodyHistory(req, res, next) {
    try {
        const { batchId } = req.params;

        if (!batchId) {
            return res.status(400).json({
                error: 'Batch ID is required.',
            });
        }

        const contract = getContract();
        const resultBytes = await contract.evaluateTransaction(
            'GetCustodyHistory',
            String(batchId).trim()
        );
        const history = parseResult(resultBytes);

        return res.status(200).json(history || []);
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/batches/:batchId/telemetry-history
 * Retrieve storage condition telemetry history for a batch.
 */
async function getTelemetryHistory(req, res, next) {
    try {
        const { batchId } = req.params;

        if (!batchId) {
            return res.status(400).json({
                error: 'Batch ID is required.',
            });
        }

        const contract = getContract();
        const resultBytes = await contract.evaluateTransaction(
            'GetTelemetryHistory',
            String(batchId).trim()
        );
        const history = parseResult(resultBytes);

        return res.status(200).json(history || []);
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/batches/:batchId/storage-rules
 * Retrieve storage condition rules applicable to a specific batch based on its crop.
 */
async function getBatchStorageRules(req, res, next) {
    try {
        const { batchId } = req.params;

        if (!batchId) {
            return res.status(400).json({
                error: 'Batch ID is required.',
            });
        }

        const contract = getContract();
        const resultBytes = await contract.evaluateTransaction(
            'GetBatchStorageRules',
            String(batchId).trim()
        );
        const rules = parseResult(resultBytes);

        return res.status(200).json(rules);
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/storage-rules/:crop
 * Retrieve configured storage requirements for a crop.
 */
async function getStorageRules(req, res, next) {
    try {
        const crop = req.params.crop || req.query.crop || 'ALL';

        const contract = getContract();
        const resultBytes = await contract.evaluateTransaction(
            'GetStorageRules',
            String(crop).trim()
        );
        const rules = parseResult(resultBytes);

        return res.status(200).json(rules);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createBatch,
    getBatchById,
    getAllBatches,
    updateStorageConditions,
    transferBatch,
    getCustodyHistory,
    getTelemetryHistory,
    getBatchStorageRules,
    getStorageRules,
};


