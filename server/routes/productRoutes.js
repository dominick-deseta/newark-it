const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.get('/type/:type', productController.getProductsByType);

// Special offers routes - accessible to all but will check for gold/platinum in controller
router.get('/offers/all', productController.getSpecialOffers);

// Admin only routes (would need admin middleware in a real app)
router.post('/', auth, productController.addProduct);
router.put('/:id', auth, productController.updateProduct);
router.delete('/:id', auth, productController.deleteProduct);

module.exports = router;