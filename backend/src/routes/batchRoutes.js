'use strict';

const express = require('express');
const {
    createBatch,
    getBatchById,
    getAllBatches,
    updateStorageConditions,
    transferBatch,
    getCustodyHistory,
    getTelemetryHistory,
    getBatchStorageRules,
} = require('../controllers/batchController');

const router = express.Router();

router.post('/', createBatch);
router.get('/', getAllBatches);
router.get('/:batchId', getBatchById);
router.put('/:batchId/storage', updateStorageConditions);
router.post('/:batchId/transfer', transferBatch);
router.get('/:batchId/custody-history', getCustodyHistory);
router.get('/:batchId/telemetry-history', getTelemetryHistory);
router.get('/:batchId/storage-rules', getBatchStorageRules);

module.exports = router;


