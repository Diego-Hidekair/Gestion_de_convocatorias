// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { loginUser, getMe } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/login', loginUser);
router.get('/me', authenticateToken, getMe);

module.exports = router;