// backend/routes/convocatoriaMateriaRoutes.js
const express = require('express');
const router = express.Router();
const convocatoriaMateriaController = require('../controllers/convocatoriaMateriaController');

// Rutas para gestionar las materias de una convocatoria
router.get('/:id_convocatoria', convocatoriaMateriaController.getConvocatoriaMaterias);
router.post('/', convocatoriaMateriaController.createConvocatoriaMateria);
router.put('/:id', convocatoriaMateriaController.updateConvocatoriaMateria);
router.delete('/:id', convocatoriaMateriaController.deleteConvocatoriaMateria);

module.exports = router;

