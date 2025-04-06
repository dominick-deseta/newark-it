const express = require('express');
const router = express.Router();
const basketController = require('../controllers/basketController');
const auth = require('../middleware/auth');

// All basket routes require authentication
router.get('/', auth, basketController.getBasket);
router.post('/items', auth, basketController.addItem);
router.put('/items/:productId', auth, basketController.updateItem);
router.delete('/items/:productId', auth, basketController.removeItem);
router.delete('/', auth, basketController.clearBasket);

module.exports = router;