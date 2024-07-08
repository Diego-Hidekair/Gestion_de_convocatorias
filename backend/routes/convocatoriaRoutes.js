// backend/routes/convocatoriaRoutes.js
const express = require('express');
const router = express.Router();
const convocatoriaController = require('../controllers/convocatoriaController');

router.get('/', convocatoriaController.getConvocatorias);
router.get('/:id', convocatoriaController.getConvocatoriaById);
router.post('/', convocatoriaController.createConvocatoria);
router.put('/:id', convocatoriaController.updateConvocatoria);
router.delete('/:id', convocatoriaController.deleteConvocatoria);

module.exports = router;
