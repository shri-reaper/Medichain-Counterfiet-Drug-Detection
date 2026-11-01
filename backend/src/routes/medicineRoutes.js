'use strict';
const express = require('express');
const {
    createMedicine, getMedicineById, getAllMedicines, verifyMedicine,
    transferMedicine, recallMedicine, reportCounterfeit, getVerificationHistory, getCustodyHistory
} = require('../controllers/medicineController');
const router = express.Router();
router.post('/', createMedicine);
router.get('/', getAllMedicines);
router.get('/:medicineId', getMedicineById);
router.post('/:medicineId/verify', verifyMedicine);
router.post('/:medicineId/transfer', transferMedicine);
router.post('/:medicineId/recall', recallMedicine);
router.post('/:medicineId/report-counterfeit', reportCounterfeit);
router.get('/:medicineId/verification-history', getVerificationHistory);
router.get('/:medicineId/custody-history', getCustodyHistory);
module.exports = router;
