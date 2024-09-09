// backend/routes/honorariosRoutes.js

const express = require('express');
const router = express.Router();
const { getHonorarios, getHonorarioById, createHonorario, updateHonorario, deleteHonorario } = require('../controllers/honorariosController');

// Obtener todos los honorarios
router.get('/', getHonorarios);

// Obtener un honorario por ID
router.get('/:id', getHonorarioById);

// Crear un nuevo honorario
router.post('/', createHonorario);

// Actualizar un honorario existente
router.put('/:id', updateHonorario);

// Eliminar un honorario
router.delete('/:id', deleteHonorario);

module.exports = router;
