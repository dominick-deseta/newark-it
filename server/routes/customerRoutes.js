const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const auth = require('../middleware/auth');

// Public routes
router.post('/', customerController.registerCustomer);
router.post('/login', customerController.loginCustomer);

// Protected routes
router.get('/profile', auth, customerController.getCustomerProfile);
router.put('/profile', auth, customerController.updateCustomerProfile);

// Credit card routes
router.get('/credit-cards', auth, customerController.getCreditCards);
router.post('/credit-cards', auth, customerController.addCreditCard);
router.delete('/credit-cards/:id', auth, customerController.deleteCreditCard);

// Shipping address routes
router.get('/shipping-addresses', auth, customerController.getShippingAddresses);
router.post('/shipping-addresses', auth, customerController.addShippingAddress);
router.put('/shipping-addresses/:id', auth, customerController.updateShippingAddress);
router.delete('/shipping-addresses/:id', auth, customerController.deleteShippingAddress);

module.exports = router;