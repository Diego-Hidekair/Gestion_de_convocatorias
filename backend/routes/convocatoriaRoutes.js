const express = require('express');
const router = express.Router();
const { getConvocatorias, getConvocatoriaById, createConvocatoria, updateConvocatoria, deleteConvocatoria, updateConvocatoriaEstado, getConvocatoriasWithEstado, createPdf } = require('../controllers/convocatoriaController');
const { authMiddleware, authorizeAdmin } = require('../middleware/authMiddleware');

// Rutas para las convocatorias
router.get('/', authMiddleware, getConvocatorias);
router.get('/:id', authMiddleware, getConvocatoriaById);
router.post('/', authMiddleware, createConvocatoria);
router.put('/:id', authMiddleware, updateConvocatoria);
router.delete('/:id', authMiddleware, deleteConvocatoria);
//router.get('/convocatorias-estado', convocatoriaController.getConvocatoriasWithEstado);
//router.put('/convocatorias/:id_convocatoria/estado', convocatoriaController.updateConvocatoriaEstado);
router.put('/:id/estado', authMiddleware, updateConvocatoriaEstado);
router.get('/estado', authMiddleware, getConvocatoriasWithEstado);
router.post('/pdf', authMiddleware, createPdf);




module.exports = router;
