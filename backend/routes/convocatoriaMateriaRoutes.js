// backend/routes/convocatoriaMateriaRoutes.js
const express = require('express');
const router = express.Router();
const convocatoriaMateriaController = require('../controllers/convocatoriaMateriaController');
const { authenticateToken, authorizeAdmin, verificarRolSecretaria } = require('../middleware/authMiddleware');

// Rutas para materias de convocatorias
router.get('/:id_convocatoria', authenticateToken, convocatoriaMateriaController.getConvocatoriaMaterias); // acceso tanto para admin como secretaria
router.post('/multiple', authenticateToken, verificarRolSecretaria, convocatoriaMateriaController.createConvocatoriaMateriaMultiple); // solo para admin y secretaria
router.delete('/:id_materias', authenticateToken, authorizeAdmin, convocatoriaMateriaController.deleteConvocatoriaMateria); // solo para admin
router.get('/convocatoria-materias/:id_convocatoria/:id_materias', authenticateToken, convocatoriaMateriaController.getConvocatoriaMateriaById); // acceso tanto para admin como secretaria
router.put('/:id_convocatoria/:id_materia', authenticateToken, verificarRolSecretaria, convocatoriaMateriaController.updateConvocatoriaMateria); // solo para admin y secretaria
router.get('/materias/carrera/:id_convocatoria', convocatoriaMateriaController.getMateriasByCarrera); // Usa la función directamente

module.exports = router;