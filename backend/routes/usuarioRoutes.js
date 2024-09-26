// backend/routes/usuarioRoutes.js
const express = require('express');
const router = express.Router();
const { createUser, getUsuarios, deleteUser, updateUser, getCurrentUser, getUsuarioById } = require('../controllers/usuarioController');
const { authenticateToken, authorizeAdmin } = require('../middleware/authMiddleware');

// Rutas para la gestión de usuarios
router.get('/', authenticateToken, authorizeAdmin, getUsuarios); // Lista de usuarios protegida
router.get('/:id', authenticateToken, getUsuarioById); // Usuario por ID protegido
router.post('/', authenticateToken, authorizeAdmin, createUser); // Crear usuario protegido
router.delete('/:id', authenticateToken, authorizeAdmin, deleteUser); // Eliminar usuario protegido
router.put('/:id', authenticateToken, authorizeAdmin, updateUser); // Actualizar usuario protegido
router.get('/me/:id', authenticateToken, getCurrentUser); // Obtener el usuario actual protegido

module.exports = router;





