const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Token validation route (protected with auth middleware)
router.get('/validate', auth, authController.validateToken);

module.exports = router;