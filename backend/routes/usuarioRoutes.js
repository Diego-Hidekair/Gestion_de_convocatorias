// backend/routes/usuarioRoutes.js
const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { authenticateToken, authorizeAdmin } = require('../middleware/authMiddleware');

router.post('/login', usuarioController.loginUser);
router.post('/', authenticateToken, authorizeAdmin, usuarioController.createUser);
router.get('/', authenticateToken, authorizeAdmin, usuarioController.getUsers);
router.delete('/:id', authenticateToken, authorizeAdmin, usuarioController.deleteUser);

module.exports = router;
