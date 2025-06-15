const db = require('../db'); // Assume you have a db connection module

// Example: const db = require('../models'); if using Sequelize

// Place a new order
exports.placeOrder = async (req, res) => {
    try {
        const { crop_id, quantity, address } = req.body;
        const buyer_id = req.user.userId;
        const status = 'Pending';

        const result = await db.query(
            'INSERT INTO orders (crop_id, buyer_id, quantity, address, status) VALUES (?, ?, ?, ?, ?)',
            [crop_id, buyer_id, quantity, address, status]
        );
        res.status(201).json({ message: 'Order placed successfully', orderId: result.insertId });
    } catch (err) {
        res.status(500).json({ error: 'Failed to place order' });
    }
};

// Get orders for a buyer
exports.getBuyerOrders = async (req, res) => {
    try {
        const buyer_id = req.user.userId;
        const [orders] = await db.query(
            'SELECT * FROM orders WHERE buyer_id = ?',
            [buyer_id]
        );
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch buyer orders' });
    }
};

// Get orders for a farmer
exports.getFarmerOrders = async (req, res) => {
    try {
        const farmer_id = req.user.userId;
        const [orders] = await db.query(
            `SELECT orders.* FROM orders
             JOIN crops ON orders.crop_id = crops.id
             WHERE crops.farmer_id = ?`,
            [farmer_id]
        );
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch farmer orders' });
    }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        await db.query(
            'UPDATE orders SET status = ? WHERE id = ?',
            [status, orderId]
        );
        res.json({ message: 'Order status updated' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update order status' });
    }
};

// Get all orders (admin)
exports.getAdminOrders = async (req, res) => {
    try {
        const [orders] = await db.query('SELECT * FROM orders');
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch all orders' });
    }
};