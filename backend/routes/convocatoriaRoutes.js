// backend/routes/convocatoriaRoutes.js
const express = require('express');
const router = express.Router();
const convocatoriaController = require('../controllers/convocatoriaController');

// Rutas para convocatorias (CRUD)
router.get('/', convocatoriaController.getConvocatorias);           // Obtener todas las convocatorias
router.get('/:id', convocatoriaController.getConvocatoriaById);      // Obtener una convocatoria por ID
router.post('/', convocatoriaController.createConvocatoria);         // Crear una nueva convocatoria
router.put('/:id', convocatoriaController.updateConvocatoria);       // Actualizar una convocatoria existente
router.delete('/:id', convocatoriaController.deleteConvocatoria);    // Eliminar una convocatoria

module.exports = router;
