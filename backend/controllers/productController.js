const db = require('../config/db');

exports.getAllProducts = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM products');
        res.json(rows);
    } catch (error) {
        console.error("Error Details:", error.message);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
};

exports.getCategories = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT DISTINCT category FROM products');
        const categories = rows.map(row => row.category);
        res.json(['All', ...categories]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch categories.' });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const { name, price, category, image_url, restaurant_id, description } = req.body;
        const [result] = await db.query(
            'INSERT INTO products (name, price, category, image_url, restaurant_id, description) VALUES (?, ?, ?, ?, ?, ?)',
            [name, price, category, image_url, restaurant_id || 1, description || null]
        );
        res.status(201).json({ message: 'Product added successfully!', id: result.insertId });
    } catch (error) {
        console.error("Add Product Error:", error);
        res.status(500).json({ error: 'An error occurred while adding product' });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, category, image_url, description } = req.body;
        await db.query(
            'UPDATE products SET name = ?, price = ?, category = ?, image_url = ?, description = ? WHERE id = ?',
            [name, price, category, image_url, description || null, id]
        );
        res.status(200).json({ message: 'Product updated successfully!' });
    } catch (error) {
        console.error("Update Product Error:", error);
        res.status(500).json({ error: 'An error occurred while updating product' });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM products WHERE id = ?', [id]);
        res.status(200).json({ message: 'Product deleted successfully!' });
    } catch (error) {
        console.error("Delete Product Error:", error);
        res.status(500).json({ error: 'An error occurred while deleting product' });
    }
};
