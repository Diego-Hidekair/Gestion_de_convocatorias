// backend/routes/convocatoriaMateriaRoutes.js
const express = require('express');
const router = express.Router();
const convocatoriaMateriaController = require('../controllers/convocatoriaMateriaController');

// Rutas para gestionar las materias de una convocatoria
router.get('/:id_convocatoria', convocatoriaMateriaController.getConvocatoriaMaterias);
//router.post('/', convocatoriaMateriaController.createConvocatoriaMateriaMultiple); // Cambia esto para usar la versión múltiple
router.post('/multiple', convocatoriaMateriaController.createConvocatoriaMateriaMultiple);
router.delete('/:id', convocatoriaMateriaController.deleteConvocatoriaMateria);
router.get('/convocatoria-materias/:id_convocatoria/:id_materia', convocatoriaMateriaController.getConvocatoriaMateriaById);
router.put('/convocatoria-materias/:id_convocatoria/:id_materia', convocatoriaMateriaController.updateConvocatoriaMateria);

module.exports = router;
