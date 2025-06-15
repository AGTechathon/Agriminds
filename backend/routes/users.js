const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/usersController');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/users/register
router.post('/register', registerUser);

// POST /api/users/login
router.post('/login', loginUser);

router.get('/me', authMiddleware, async (req, res) => {
    // You can access req.user.userId or req.user.role here
    res.json({ message: 'Welcome to your profile', user: req.user });
});

module.exports = router;
