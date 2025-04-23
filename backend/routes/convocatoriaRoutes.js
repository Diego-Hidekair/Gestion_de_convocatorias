// backend/routes/convocatoriaRoutes.js
const express = require('express');
const router = express.Router();
const convocatoriaController = require('../controllers/convocatoriaController');
const { authenticateToken, verificarRolSecretaria } = require('../middleware/authMiddleware');

router.use(authenticateToken); 
router.get('/', convocatoriaController.getConvocatorias);
router.get('/:id', convocatoriaController.getConvocatoriaById);
router.post('/', verificarRolSecretaria, convocatoriaController.createConvocatoria);
router.put('/:id', verificarRolSecretaria, convocatoriaController.updateConvocatoria);
router.put('/:id/estado', (req, res, next) => { if (['tecnico_vicerrectorado', 'vicerrectorado', 'admin'].includes(req.user.rol)) { return next();}return res.status(403).json({ error: 'Acceso denegado' });},convocatoriaController.updateEstadoConvocatoria);

router.get('/facultad/actual', convocatoriaController.getConvocatoriasByFacultad);
router.get('/facultad/estado/:estado', convocatoriaController.getConvocatoriasByFacultadAndEstado);

module.exports = router;