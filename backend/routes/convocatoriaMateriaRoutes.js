// backend/routes/convocatoriaMateriaRoutes.js
const express = require('express');
const router = express.Router();
const convocatoriaMateriaController = require('../controllers/convocatoriaMateriaController');
const { authenticateToken, authorizeAdmin, verificarRolSecretaria } = require('../middleware/authMiddleware');

// Rutas para materias de convocatorias
router.get('/:id_convocatoria', authenticateToken, convocatoriaMateriaController.getConvocatoriaMaterias);
router.post('/multiple', authenticateToken, verificarRolSecretaria, convocatoriaMateriaController.createConvocatoriaMateriaMultiple);
router.delete('/:id_materias', authenticateToken, authorizeAdmin, convocatoriaMateriaController.deleteConvocatoriaMateria);
router.get('/convocatoria-materias/:id_convocatoria/:id_materias', authenticateToken, convocatoriaMateriaController.getConvocatoriaMateriaById);
router.put('/:id_convocatoria/:id_materia', authenticateToken, verificarRolSecretaria, convocatoriaMateriaController.updateConvocatoriaMateria);
router.get('/materias/carrera/:id_convocatoria', convocatoriaMateriaController.getMateriasByCarrera); // Ruta que estamos probando

module.exports = router;