// backend/routes/tipoConvocatoriaRoutes.js
const express = require('express');
const router = express.Router();
const tipoConvocatoriaController = require('../controllers/tipoConvocatoriaController');

// Define las rutas de tipo convocatoria
router.get('/', tipoConvocatoriaController.getAllTiposConvocatoria);
router.get('/:id', tipoConvocatoriaController.getTipoConvocatoriaById);
router.post('/', tipoConvocatoriaController.createTipoConvocatoria);
router.put('/:id', tipoConvocatoriaController.updateTipoConvocatoria);
router.delete('/:id', tipoConvocatoriaController.deleteTipoConvocatoria);

module.exports = router;
