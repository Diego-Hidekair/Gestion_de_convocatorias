const express = require('express');
const router = express.Router();
const convocatoriaController = require('../controllers/convocatoriaController');
const authMiddleware = require('../middlewares/authMiddleware');

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Rutas para convocatorias
router.get('/', convocatoriaController.getConvocatorias);
router.get('/:id', convocatoriaController.getConvocatoriaById);
router.post('/', convocatoriaController.createConvocatoria);
router.put('/:id', convocatoriaController.updateConvocatoria);
router.put('/:id/estado', convocatoriaController.updateEstadoConvocatoria);

// Rutas específicas por facultad/estado
router.get('/facultad/actual', convocatoriaController.getConvocatoriasByFacultad);
router.get('/facultad/estado/:estado', convocatoriaController.getConvocatoriasByFacultadAndEstado);

module.exports = router;