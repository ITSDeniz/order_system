const db = require('../config/db');

exports.createOrder = async (req, res) => {
    try {
        const { customer_name, customer_phone, customer_address, total_price, items, restaurant_id } = req.body;
        const itemsSummary = items.map(item => item.name).join(', ');

        // Always use the authenticated user's ID from the JWT token — never trust user_id from the body
        const userId = req.user ? req.user.id : null;

        const [result] = await db.query(
            'INSERT INTO orders (customer_name, customer_phone, customer_address, total_price, items_summary, user_id, restaurant_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [customer_name, customer_phone, customer_address, total_price, itemsSummary, userId, restaurant_id || 1]
        );
        res.status(201).json({ message: 'Your order is taken successfully!', orderId: result.insertId });
    } catch (error) {
        console.error("Order Error:", error);
        res.status(500).json({ error: 'An error occurred while saving' });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const restaurant_id = req.query.restaurant_id;
        let query = 'SELECT * FROM orders ORDER BY id DESC';
        let params = [];
        if (restaurant_id) {
            query = 'SELECT * FROM orders WHERE restaurant_id = ? ORDER BY id DESC';
            params = [restaurant_id];
        }
        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error("Fetch Orders Error:", error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query('SELECT * FROM orders WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Order not found' });

        const order = rows[0];

        // Prevent IDOR: Ensure the user is only requesting their own order unless they are an admin
        if (req.user && req.user.id !== order.user_id && req.user.is_admin !== 1) {
            return res.status(403).json({ error: 'Access denied. You can only view your own orders.' });
        }

        res.json(order);
    } catch (error) {
        console.error("Fetch Order Error:", error);
        res.status(500).json({ error: 'Failed to fetch order' });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
        res.json({ message: 'Status updated successfully' });
    } catch (error) {
        console.error("Update Status Error:", error);
        res.status(500).json({ error: 'Failed to update status' });
    }
};

exports.deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM orders WHERE id = ?', [id]);
        res.status(200).json({ message: 'Order deleted successfully!' });
    } catch (error) {
        console.error("Delete Order Error:", error);
        res.status(500).json({ error: 'Failed to delete order' });
    }
};

// User-initiated cancellation (only for Pending orders they own)
exports.cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query('SELECT * FROM orders WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Order not found' });

        const order = rows[0];

        // Prevent users from cancelling others' orders
        if (req.user.id !== order.user_id && req.user.is_admin !== 1) {
            return res.status(403).json({ error: 'Access denied.' });
        }

        // Only allow cancelling Pending orders
        if (order.status !== 'Pending') {
            return res.status(400).json({ error: 'Only Pending orders can be cancelled.' });
        }

        await db.query("UPDATE orders SET status = 'Cancelled' WHERE id = ?", [id]);
        res.json({ message: 'Order cancelled successfully.' });
    } catch (error) {
        console.error("Cancel Order Error:", error);
        res.status(500).json({ error: 'Failed to cancel order' });
    }
};

