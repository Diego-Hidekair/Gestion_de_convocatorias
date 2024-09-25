// backend/routes/usuarioRoutes.js
const express = require('express');
const router = express.Router();
const { createUser, getUsuarios, deleteUser, updateUser, getCurrentUser, getUsuarioById } = require('../controllers/usuarioController');
const { authenticateToken, authorizeAdmin } = require('../middleware/authMiddleware');

// Rutas para la gestión de usuarios
router.get('/', /*authenticateToken, authorizeAdmin,*/ getUsuarios);
router.get('/:id', /*authenticateToken,*/ getUsuarioById); // Ruta para obtener un usuario por ID
router.post('/', /*authenticateToken, authorizeAdmin,*/ createUser);
router.delete('/:id', /*authenticateToken, authorizeAdmin,*/ deleteUser);
router.put('/:id', /*authenticateToken, authorizeAdmin,*/ updateUser);
router.get('/me/:id', getCurrentUser); // Ahora acepta el ID del usuario en la URL


module.exports = router;
