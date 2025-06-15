const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const cropsController = require('../controllers/cropsController');

const router = express.Router();
router.use(authMiddleware);

// GET /api/crops - Public: Get all approved crops
router.get('/', cropsController.getAllCrops);

// GET /api/crops/:id - Public: Get single crop by ID
router.get('/:id', cropsController.getCropById);

// POST /api/crops - Only farmers can add crops (status='pending')
router.post(
    '/',
    authMiddleware,
    authorizeRoles(['farmer']),
    cropsController.addCrop
);

// GET /api/crops/pending - Only admin can view pending crops
router.get(
    '/pending',
    authMiddleware,
    authorizeRoles(['admin']),
    cropsController.getPendingCrops
);

// PUT /api/crops/:id/approve - Only admin can approve a crop
router.put(
    '/:id/approve',
    authMiddleware,
    authorizeRoles(['admin']),
    cropsController.approveCrop
);

// PUT /api/crops/:id/reject - Only admin can reject a crop
router.put(
    '/:id/reject',
    authMiddleware,
    authorizeRoles(['admin']),
    cropsController.rejectCrop
);

module.exports = router;
