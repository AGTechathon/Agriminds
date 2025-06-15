const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const buyersController = require('../controllers/buyersController');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Ensure this folder exists
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `buyer-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ storage });

// Protect all routes
router.use(authMiddleware);

// GET /api/buyer/profile
router.get('/profile', buyersController.getProfile);

// PUT /api/buyer/profile
router.put('/profile', upload.single('profile_pic'), buyersController.updateProfile);

// GET /api/buyers/marketplace
router.get('/marketplace', buyersController.getMarketplace);

// POST /api/buyers/orders
router.post('/orders', buyersController.placeOrder);

// GET /api/buyers/orders
router.get('/orders', buyersController.getBuyerOrders);

// PUT /api/buyers/orders/:orderId/cancel
router.put('/orders/:orderId/cancel', buyersController.cancelOrder);

// GET /api/buyers/dashboard
router.get('/dashboard', buyersController.getDashboard);

module.exports = router;