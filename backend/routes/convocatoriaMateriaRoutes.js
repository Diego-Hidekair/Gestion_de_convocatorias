// backend/routes/convocatoriaMateriaRoutes.js
const express = require('express');
const router = express.Router();
const {getConvocatoriaMaterias, getConvocatoriaMateriaById, createConvocatoriaMateriaMultiple, updateConvocatoriaMateria, deleteConvocatoriaMateria} = require('../controllers/convocatoriaMateriaController');

// Rutas
router.get('/convocatorias-materias/:id_convocatoria/materias', getConvocatoriaMaterias);
router.get('/convocatorias-materias/:id_convocatoria/materia/:id_materia', getConvocatoriaMateriaById);
router.post('/convocatorias-materias/:id_convocatoria/materias', createConvocatoriaMateriaMultiple);
router.put('/convocatorias-materias/:id_convocatoria/materia/:id_materia', updateConvocatoriaMateria);
router.delete('/convocatorias-materias/materia/:id_materias', deleteConvocatoriaMateria);

module.exports = router;
