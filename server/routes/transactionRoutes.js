const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const auth = require('../middleware/auth');

// All transaction routes require authentication
router.post('/', auth, transactionController.createTransaction);
router.get('/', auth, transactionController.getTransactions);
router.get('/:id', auth, transactionController.getTransactionById);
router.get('/filter', auth, transactionController.filterTransactions);
router.put('/:id/tag', auth, transactionController.updateDeliveryStatus);

module.exports = router;