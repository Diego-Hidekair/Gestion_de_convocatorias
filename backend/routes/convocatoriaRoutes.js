// backend/routes/convocatoriaRoutes.js
const express = require('express');
const router = express.Router();
const convocatoriaController = require('../controllers/convocatoriaController');
const { authenticateToken, authorizeAdmin } = require('../middleware/authMiddleware');

// Rutas para convocatorias (CRUD)
router.get('/', convocatoriaController.getConvocatorias);
router.get('/:id', convocatoriaController.getConvocatoriaById);
router.post('/', authenticateToken, convocatoriaController.createConvocatoria);
router.put('/:id', authenticateToken, convocatoriaController.updateConvocatoria);
router.delete('/:id_convocatoria', authenticateToken, convocatoriaController.deleteConvocatoria);

// Ruta para obtener convocatorias por estado (maneja diferentes estados)
router.get('/estado/:estado', convocatoriaController.getConvocatoriasByEstado);

// Ruta para actualizar solo el estado de una convocatoria
router.patch('/:id/estado', authenticateToken, convocatoriaController.updateEstadoConvocatoria);

module.exports = router;
