const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const farmersController = require('../controllers/farmersController');
const multer = require('multer');
const router = express.Router();
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Ensure this folder exists
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `farmer-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ storage });

// Protect all routes
router.use(authMiddleware);

// GET /api/farmer/profile
router.get('/profile', farmersController.getProfile);

// PUT /api/farmer/profile
router.put('/profile', upload.single('profile_pic'), farmersController.updateProfile);

// GET /api/farmer/crops
router.get('/crops', farmersController.getCrops);

// POST /api/farmer/crops
router.post('/crops', upload.array('crop_images', 5), farmersController.addCrop);

// DELETE /api/farmer/crops/:id
router.delete('/crops/:id', farmersController.deleteCrop);

// GET /api/farmer/orders
router.get('/orders', farmersController.getOrders);

// GET /api/farmer/dashboard
router.get('/dashboard', farmersController.getDashboard);

module.exports = router;