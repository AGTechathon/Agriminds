const express = require('express');
const db = require('../db'); // Assume you have a db.js for database connection
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/orders - Buyers place order
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { crop_id, quantity, address } = req.body;
        const buyer_id = req.user.id;
        const result = await db.query(
            'INSERT INTO orders (buyer_id, crop_id, quantity, address, status, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *',
            [buyer_id, crop_id, quantity, address, 'pending']
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to place order' });
    }
});

// GET /api/orders - Buyers see own orders
router.get('/', authMiddleware, async (req, res) => {
    try {
        const buyer_id = req.user.id;
        const result = await db.query(
            'SELECT * FROM orders WHERE buyer_id = $1 ORDER BY created_at DESC',
            [buyer_id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// GET /api/orders/farmers - Farmers see orders for their crops
router.get('/farmers', authMiddleware, async (req, res) => {
    try {
        const farmer_id = req.user.id;
        const result = await db.query(
            `SELECT o.* FROM orders o
             JOIN crops c ON o.crop_id = c.id
             WHERE c.farmer_id = $1
             ORDER BY o.created_at DESC`,
            [farmer_id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch farmer orders' });
    }
});

// PUT /api/orders/:id/status - Admin or delivery agent update status
router.put('/:id/status', authMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        const orderId = req.params.id;
        // Check if user is admin or delivery agent
        if (!['admin', 'delivery'].includes(req.user.role)) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const result = await db.query(
            'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
            [status, orderId]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update order status' });
    }
});

// GET /api/orders/dashboard - Admin dashboard
router.get('/dashboard', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden' });
        }
        // Example dashboard: total orders, pending, completed
        const stats = {};
        const total = await db.query('SELECT COUNT(*) FROM orders');
        const pending = await db.query("SELECT COUNT(*) FROM orders WHERE status = 'pending'");
        const completed = await db.query("SELECT COUNT(*) FROM orders WHERE status = 'completed'");
        stats.total = parseInt(total.rows[0].count, 10);
        stats.pending = parseInt(pending.rows[0].count, 10);
        stats.completed = parseInt(completed.rows[0].count, 10);
        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

module.exports = router;