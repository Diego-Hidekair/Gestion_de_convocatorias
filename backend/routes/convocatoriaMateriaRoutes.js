// backend/routes/convocatoriaMateriaRoutes.js
const express = require('express');
const router = express.Router();
const convocatoriaMateriaController = require('../controllers/convocatoriaMateriaController');

// Rutas para gestionar las materias de una convocatoria
router.get('/:id_convocatoria', convocatoriaMateriaController.getConvocatoriaMaterias);
router.post('/', convocatoriaMateriaController.createConvocatoriaMateria);
router.delete('/:id', convocatoriaMateriaController.deleteConvocatoriaMateria);
router.get('/convocatoria-materias/:id_convocatoria/:id_materia', convocatoriaMateriaController.getConvocatoriaMateriaById);
router.put('/convocatoria-materias/:id_convocatoria/:id_materia', convocatoriaMateriaController.updateConvocatoriaMateria);
//router.get('/:id_convocatoria', convocatoriaMateriaController.getConvocatoriaMaterias);
//router.put('/:id', convocatoriaMateriaController.updateConvocatoriaMateria);
router.post('/', convocatoriaMateriaController.createConvocatoriaMateria);

module.exports = router;
