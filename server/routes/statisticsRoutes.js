const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statisticsController');
const auth = require('../middleware/auth');

// All statistics routes require authentication
// In a real app, we would have admin middleware to restrict these to admin users only
router.get('/credit-cards', auth, statisticsController.getCreditCardStats);
router.get('/best-customers', auth, statisticsController.getBestCustomers);
router.get('/top-products', auth, statisticsController.getTopProducts);
router.get('/popular-products', auth, statisticsController.getPopularProducts);
router.get('/basket-totals', auth, statisticsController.getBasketTotals);
router.get('/product-type-avg', auth, statisticsController.getProductTypeAvg);

module.exports = router;