// backend/routes/tipoConvocatoriaRoutes.js
const express = require('express');
const router = express.Router();
const tipoConvocatoriaController = require('../controllers/tipoConvocatoriaController');

router.get('/', tipoConvocatoriaController.getTipoConvocatorias);
router.post('/', tipoConvocatoriaController.createTipoConvocatoria); // Cambiado de '/tipo_convocatorias' a '/'
router.put('/:id', tipoConvocatoriaController.updateTipoConvocatoria);
router.delete('/:id', tipoConvocatoriaController.deleteTipoConvocatoria);
router.get('/:id', tipoConvocatoriaController.getTipoConvocatoriaById);

module.exports = router;

