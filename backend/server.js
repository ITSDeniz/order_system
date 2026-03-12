const express = require('express');
const cors = require('cors')
require('dotenv').config();
const db = require('./config/db');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({ origin: 'http://localhost:5173' })); // Only accept requests from the frontend
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Order System backend Working');
});

app.listen(PORT, () => {
    console.log(`Server runs on http://localhost:${PORT}`);
});

// Import the new route modules
const restaurantRoutes = require('./routes/restaurantRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const authRoutes = require('./routes/authRoutes');

// Mount routes
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api', authRoutes); // Auth routes already handle their exact paths (like /signup, /login, /users/:id/orders)

// Backwards compatibility for exact frontend string matches
app.get('/api/get/categories', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT DISTINCT category FROM products');
        const categories = rows.map(row => row.category);
        res.json(['All', ...categories]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch categories.' });
    }
});
