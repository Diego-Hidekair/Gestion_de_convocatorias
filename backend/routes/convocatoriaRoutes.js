// backend/routes/convocatoriaRoutes.js
const express = require('express');
const router = express.Router();
const convocatoriaController = require('../controllers/convocatoriaController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const { validationResult } = require('express-validator');
const secretariaOnly = authorizeRoles(['secretaria_de_decanatura']);
const vicerrectorOnly = authorizeRoles(['vicerrectorado', 'tecnico_vicerrectorado']);

router.use(authenticateToken);

// Rutas GET
router.get('/', convocatoriaController.getConvocatorias);
router.get('/facultad/actual', convocatoriaController.getConvocatoriasByFacultad);
router.get('/facultad/estado/:estado', convocatoriaController.getConvocatoriasByFacultadAndEstado);
router.get('/:id', convocatoriaController.getConvocatoriaById);

// Ruta POST con validación
router.post( '/', secretariaOnly, convocatoriaController.validateConvocatoria,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }, convocatoriaController.createConvocatoria);

// Ruta PUT con validación
router.put( '/:id', secretariaOnly, convocatoriaController.validateConvocatoria,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }, convocatoriaController.updateConvocatoria );

// Rutas de estado
router.put('/:id/estado', vicerrectorOnly, convocatoriaController.updateEstadoConvocatoria);
router.put('/:id/comentario', vicerrectorOnly, convocatoriaController.updateComentarioObservado);

module.exports = router;