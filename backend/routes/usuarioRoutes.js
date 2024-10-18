// backend/routes/usuarioRoutes.js
const express = require('express');
const router = express.Router();
const { createUser, getUsuarios, deleteUser, updateUser, getCurrentUser, getUsuarioById } = require('../controllers/usuarioController');
const { authenticateToken, authorizeAdmin } = require('../middleware/authMiddleware');

router.get('/me', authenticateToken, getCurrentUser);
router.get('/', authenticateToken, authorizeAdmin, getUsuarios);
router.get('/:id', authenticateToken, getUsuarioById);
router.post('/', authenticateToken, authorizeAdmin, createUser);
router.delete('/:id', authenticateToken, authorizeAdmin, deleteUser);
router.put('/:id', authenticateToken, authorizeAdmin, updateUser);

module.exports = router;
