const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Keeping this here for now because it relates to user details
router.get('/users/:id/orders', verifyToken, authController.getUserOrders);

module.exports = router;
