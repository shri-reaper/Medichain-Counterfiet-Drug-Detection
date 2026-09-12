'use strict';

const express = require('express');
const { getStorageRules } = require('../controllers/batchController');

const router = express.Router();

// GET /api/storage-rules
router.get('/', (req, res, next) => {
    req.params.crop = 'ALL';
    getStorageRules(req, res, next);
});

// GET /api/storage-rules/:crop
router.get('/:crop', getStorageRules);

module.exports = router;
