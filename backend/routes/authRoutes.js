// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { loginUser } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Ruta de login
router.post('/login', loginUser);

// Ruta para obtener la información del usuario autenticado
router.get('/me', authenticateToken, (req, res) => {
    res.json({
        id_usuario: req.user.id_usuario,
        rol: req.user.rol,
        id_facultad: req.user.id_facultad,
    });
});

module.exports = router;