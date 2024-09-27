// backend/routes/convocatoriaRoutes.js
const express = require('express');
const router = express.Router();
const convocatoriaController = require('../controllers/convocatoriaController');

// Rutas para convocatorias (CRUD)
router.get('/', convocatoriaController.getConvocatorias);
router.get('/:id', convocatoriaController.getConvocatoriaById);
router.post('/', convocatoriaController.createConvocatoria);
router.put('/:id', convocatoriaController.updateConvocatoria);
router.delete('/:id_convocatoria', convocatoriaController.deleteConvocatoria);

// Rutas para los estados de la convocatoria
router.get('/estado/para-revision', convocatoriaController.getConvocatoriasByEstado);
router.get('/estado/en-revision', convocatoriaController.getConvocatoriasByEstado);
router.get('/estado/observado', convocatoriaController.getConvocatoriasByEstado);
router.get('/estado/revisado', convocatoriaController.getConvocatoriasByEstado);

module.exports = router;
