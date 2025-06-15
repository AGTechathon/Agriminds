const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const adminController = require('../controllers/adminController'); // Import the admin controller

const router = express.Router();

// Protect all admin routes
router.use(authMiddleware);
router.use(authorizeRoles(['admin']));

// GET /api/admin/users - Get all users
router.get('/users', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM users');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// GET /api/admin/crops/pending - Get all pending crops
router.get('/crops/pending', async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM crops WHERE status = $1',
            ['pending']
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch pending crops' });
    }
});

// PUT /api/admin/crops/:id/approve - Approve a crop
router.put('/crops/:id/approve', async (req, res) => {
    try {
        const { id } = req.params;
        await db.query("UPDATE crops SET status = 'approved' WHERE id = $1", [id]);
        res.json({ message: 'Crop approved' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to approve crop' });
    }
});

// PUT /api/admin/crops/:id/reject - Reject a crop
router.put('/crops/:id/reject', async (req, res) => {
    try {
        const { id } = req.params;
        await db.query("UPDATE crops SET status = 'rejected' WHERE id = $1", [id]);
        res.json({ message: 'Crop rejected' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to reject crop' });
    }
});

// GET /api/admin/orders - Get all orders
router.get('/AdminOrders', async (req, res) => {
    try {
        // For admins, get all orders with full details
        const result = await db.query(
            `SELECT o.*, c.name as crop_name, c.unit, c.price,
                    f.name as farmer_name, b.name as buyer_name
             FROM orders o
             JOIN crops c ON o.crop_id = c.id
             JOIN users f ON c.farmer_id = f.id
             JOIN users b ON o.buyer_id = b.id
             ORDER BY o.created_at DESC`
        );
        
        console.log(`✅ Found ${result.rows.length} orders for admin view`);
        res.json(result.rows);
    } catch (err) {
        console.error('❌ Error fetching admin orders:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/admin/dashboard - Get dashboard stats
router.get('/dashboard', async (req, res) => {
    try {
        const userCountResult = await db.query('SELECT COUNT(*) as users FROM users');
        const cropCountResult = await db.query('SELECT COUNT(*) as crops FROM crops');
        const pendingCropsResult = await db.query("SELECT COUNT(*) as pendingCrops FROM crops WHERE status = 'pending'");
        const orderCountResult = await db.query('SELECT COUNT(*) as orders FROM orders');
        res.json({
            users: Number(userCountResult.rows[0].users),
            crops: Number(cropCountResult.rows[0].crops),
            pendingCrops: Number(pendingCropsResult.rows[0].pendingcrops),
            orders: Number(orderCountResult.rows[0].orders)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

// Add this route to your existing admin routes
router.get('/crops', adminController.getCropSubmissions);
router.put('/crops/:id/status', adminController.updateCropStatus);

module.exports = router;