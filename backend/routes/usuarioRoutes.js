// backend/routes/usuarioRoutes.js
const express = require('express');
const router = express.Router();
const { createUser, getUsuarios, deleteUser, loginUser, updateUser, getUsuarioById } = require('../controllers/usuarioController');
//const { authenticateToken, authorizeAdmin } = require('../middleware/authMiddleware');

// Rutas para la gestión de usuarios
router.get('/', /*authenticateToken, authorizeAdmin,*/ getUsuarios);
router.post('/', /*authenticateToken, authorizeAdmin,*/ createUser);
router.delete('/:id', /*authenticateToken, authorizeAdmin,*/ deleteUser);
router.post('/login', loginUser);
router.put('/:id', /*authenticateToken, authorizeAdmin,*/ updateUser);

// Ruta para obtener un usuario por ID
router.get('/:id', /*authenticateToken, authorizeAdmin,*/ getUsuarioById);

module.exports = router;
