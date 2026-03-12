const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('FATAL ERROR: JWT_SECRET is not defined in environment variables.');
}

exports.signup = async (req, res) => {
    try {
        const { name, email, password, phone, address } = req.body;
        const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) return res.status(400).json({ error: 'Email already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await db.query(
            'INSERT INTO users (name, email, password, phone, address) VALUES (?, ?, ?, ?, ?)',
            [name, email, hashedPassword, phone, address]
        );
        res.status(201).json({ message: 'User registered successfully!', userId: result.insertId });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ error: 'Failed to sign up' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(401).json({ error: 'Invalid email or password' });

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });

        // Generate JWT Token
        const token = jwt.sign(
            { id: user.id, is_admin: user.is_admin },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        delete user.password;
        res.json({ message: 'Login successful', user, token });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: 'Failed to log in' });
    }
};

exports.getUserOrders = async (req, res) => {
    try {
        const { id } = req.params;

        // Prevent IDOR: Ensure the user is only requesting their own data unless they are an admin
        if (req.user.id !== parseInt(id) && req.user.is_admin !== 1) {
            return res.status(403).json({ error: 'Access denied. You can only view your own orders.' });
        }

        const [rows] = await db.query('SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC', [id]);
        res.json(rows);
    } catch (error) {
        console.error("Fetch User Orders Error:", error);
        res.status(500).json({ error: 'Failed to fetch user orders' });
    }
};
