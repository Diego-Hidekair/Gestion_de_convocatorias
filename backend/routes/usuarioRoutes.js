// backend/routes/usuarioRoutes.js
const express = require('express');
const multer = require('multer');
const router = express.Router();

const { createUser, getUsuarios, deleteUser, updateUser, getCurrentUser, getUsuarioById } = require('../controllers/usuarioController');
const { authenticateToken, authorizeAdmin } = require('../middleware/authMiddleware');
const upload = multer({ storage: multer.memoryStorage() }); 


router.get('/me', authenticateToken, getCurrentUser);
router.get('/', authenticateToken, authorizeAdmin, getUsuarios);
router.get('/:id_usuario', authenticateToken, getUsuarioById);
//router.post('/', authenticateToken, authorizeAdmin, createUser);
router.post('/', authenticateToken, authorizeAdmin, upload.single('foto_perfil'), createUser);
router.put('/:id_usuario', authenticateToken, authorizeAdmin, upload.single('foto_perfil'), updateUser);
//router.put('/:id_usuario', authenticateToken, authorizeAdmin, updateUser);
router.delete('/:id_usuario', authenticateToken, authorizeAdmin, deleteUser);

module.exports = router;








