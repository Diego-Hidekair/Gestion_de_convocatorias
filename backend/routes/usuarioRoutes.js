// backend/routes/usuarioRoutes.js
const express = require('express');
const router = express.Router();
const UserController = require('../controllers/usuarioController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const { upload } = require('../config/multerConfig');
const adminOnly = authorizeRoles(['admin']);
const adminOrSecretary = authorizeRoles(['admin', 'secretaria_de_decanatura']);

router.get('/me', authenticateToken, UserController.getCurrentUser);
router.get('/', authenticateToken, adminOnly, UserController.getUsuarios);
router.get('/:id_usuario', authenticateToken, UserController.getUsuarioById);
router.post('/', authenticateToken, adminOrSecretary, upload.single('foto_perfil'), UserController.createUser);
router.put('/:id', authenticateToken, authorizeRoles(['admin', 'secretaria_de_decanatura']), upload.single('foto_perfil'), UserController.updateUser);
router.delete('/:id_usuario', authenticateToken, adminOnly, UserController.deleteUser);

module.exports = router;
