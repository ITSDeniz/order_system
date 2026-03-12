const db = require('../config/db');

exports.getAllRestaurants = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM restaurants');
        res.json(rows);
    } catch (error) {
        console.error("Fetch Restaurants Error:", error);
        res.status(500).json({ error: 'Failed to fetch restaurants' });
    }
};

exports.getRestaurantById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query('SELECT * FROM restaurants WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Restaurant not found' });
        res.json(rows[0]);
    } catch (error) {
        console.error("Fetch Restaurant Error:", error);
        res.status(500).json({ error: 'Failed' });
    }
};

exports.getRestaurantProducts = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query('SELECT * FROM products WHERE restaurant_id = ?', [id]);
        res.json(rows);
    } catch (error) {
        console.error("Fetch Products Error:", error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
};

exports.getRestaurantCategories = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query('SELECT DISTINCT category FROM products WHERE restaurant_id = ?', [id]);
        const categories = rows.map(row => row.category);
        res.json(['All', ...categories]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch categories.' });
    }
};
