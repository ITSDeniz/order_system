const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

router.post('/', verifyToken, orderController.createOrder); // users place orders
router.get('/', verifyAdmin, orderController.getAllOrders); // admins view all orders
router.get('/:id', verifyToken, orderController.getOrderById); // users/admins view an order
router.put('/:id/status', verifyAdmin, orderController.updateOrderStatus);
router.delete('/:id', verifyAdmin, orderController.deleteOrder);
router.patch('/:id/cancel', verifyToken, orderController.cancelOrder); // user cancels own pending order

module.exports = router;
