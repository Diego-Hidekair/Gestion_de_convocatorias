// backend/routes/tipoConvocatoriaRoutes.js
const express = require('express');
const router = express.Router();
const { getAllTiposConvocatoria, getTipoConvocatoriaById, createTipoConvocatoria, updateTipoConvocatoria, deleteTipoConvocatoria } = require('../controllers/tipoConvocatoriaController');

// Rutas para la gestión de tipos de convocatoria
router.get('/', getAllTiposConvocatoria); // Obtener todos los tipos de convocatoria
router.get('/:id', getTipoConvocatoriaById); // Obtener un tipo de convocatoria por ID
router.post('/', createTipoConvocatoria); // Crear un nuevo tipo de convocatoria
router.put('/:id', updateTipoConvocatoria); // Actualizar un tipo de convocatoria por ID
router.delete('/:id', deleteTipoConvocatoria); // Eliminar un tipo de convocatoria por ID

module.exports = router;
