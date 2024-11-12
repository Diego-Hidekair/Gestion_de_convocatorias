// backend/routes/convocatoriaRoutes.js
const express = require('express');
const router = express.Router();
const convocatoriaController = require('../controllers/convocatoriaController');
const { authenticateToken, authorizeAdmin, verificarRolSecretaria } = require('../middleware/authMiddleware');

// Rutas para convocatorias (CRUD)
router.get('/', authenticateToken, convocatoriaController.getConvocatorias); 
router.get('/:id', authenticateToken, convocatoriaController.getConvocatoriaById); 
router.post('/', authenticateToken, verificarRolSecretaria, convocatoriaController.createConvocatoria); 
router.put('/:id', authenticateToken, verificarRolSecretaria, convocatoriaController.updateConvocatoria); 
router.delete('/:id_convocatoria', authenticateToken, authorizeAdmin, convocatoriaController.deleteConvocatoria); 

// Ruta para obtener convocatorias por estado
router.get('/estado/:estado', authenticateToken, convocatoriaController.getConvocatoriasByEstado); 

// Ruta para actualizar solo el estado de una convocatoria
router.patch('/:id/estado', authenticateToken, verificarRolSecretaria, convocatoriaController.updateEstadoConvocatoria); 

module.exports = router;