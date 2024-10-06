// backend/routes/convocatoriaRoutes.js
const express = require('express');
const router = express.Router();
const convocatoriaController = require('../controllers/convocatoriaController');
const { authenticateToken, authorizeAdmin } = require('../middleware/authMiddleware'); // Importa el middleware


// Rutas para convocatorias (CRUD)
router.get('/', convocatoriaController.getConvocatorias);
router.get('/:id', convocatoriaController.getConvocatoriaById);
//router.post('/', convocatoriaController.createConvocatoria);
router.post('/', authenticateToken, convocatoriaController.createConvocatoria);
router.put('/:id', authenticateToken, convocatoriaController.updateConvocatoria);
router.delete('/:id_convocatoria', authenticateToken, convocatoriaController.deleteConvocatoria);

// Rutas para los estados de la convocatoria
router.get('/estado/para-revision', convocatoriaController.getConvocatoriasByEstado);
router.get('/estado/en-revision', convocatoriaController.getConvocatoriasByEstado);
router.get('/estado/observado', convocatoriaController.getConvocatoriasByEstado);
router.get('/estado/revisado', convocatoriaController.getConvocatoriasByEstado);
//router.get('/estado/:estado', convocatoriaController.getConvocatoriasByEstado);


module.exports = router;




