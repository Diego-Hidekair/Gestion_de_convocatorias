// backend/routes/usuarioRoutes.js
const express = require('express');
const router = express.Router();
const { createUser, getUsuarios, deleteUser, loginUser, updateUser, getUsuarioById } = require('../controllers/usuarioController');

// Rutas para la gestión de usuarios
router.get('/', getUsuarios);
router.post('/', createUser);
router.delete('/:id', deleteUser);
router.post('/login', loginUser);
router.put('/:id', updateUser);
router.get('/:id', getUsuarioById);

module.exports = router;