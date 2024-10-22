// backend/routes/convocatoriaMateriaRoutes.js
const express = require('express');
const router = express.Router();
const convocatoriaMateriaController = require('../controllers/convocatoriaMateriaController');

//rutas
router.get('/:id_convocatoria', convocatoriaMateriaController.getConvocatoriaMaterias);
router.post('/multiple', convocatoriaMateriaController.createConvocatoriaMateriaMultiple);
router.delete('/:id_materias', convocatoriaMateriaController.deleteConvocatoriaMateria); 
router.get('/convocatoria-materias/:id_convocatoria/:id_materias', convocatoriaMateriaController.getConvocatoriaMateriaById);
router.get('/convocatoria-materias/:id_convocatoria/:id_materia', convocatoriaMateriaController.getConvocatoriaMateriaById); 
router.put('/:id_convocatoria/:id_materia', convocatoriaMateriaController.updateConvocatoriaMateria); 

module.exports = router;
