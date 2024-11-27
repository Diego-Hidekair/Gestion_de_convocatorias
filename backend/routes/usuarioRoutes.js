// backend/routes/usuarioRoutes.js
const express = require('express');
const router = express.Router();
const { createUser, upload, getUsuarios, deleteUser, updateUser, getCurrentUser, getUsuarioById } = require('../controllers/usuarioController');
const { authenticateToken, authorizeAdmin } = require('../middleware/authMiddleware');

router.get('/me', authenticateToken, getCurrentUser);
router.get('/', authenticateToken, authorizeAdmin, getUsuarios);
router.get('/:id_usuario', authenticateToken, getUsuarioById);
//router.post('/', authenticateToken, authorizeAdmin, createUser);
router.post('/', upload.single('foto_perfil'), authenticateToken, authorizeAdmin, createUser);
router.delete('/:id_usuario', authenticateToken, authorizeAdmin, deleteUser);
router.put('/:id_usuario', authenticateToken, authorizeAdmin, updateUser);

module.exports = router;