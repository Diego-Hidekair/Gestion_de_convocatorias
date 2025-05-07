// backend/routes/convocatoriaRoutes.js
const express = require('express');
const router = express.Router();
const convocatoriaController = require('../controllers/convocatoriaController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const { validationResult } = require('express-validator'); 
const secretariaOnly = authorizeRoles(['secretaria_de_decanatura']);
const vicerrectorOnly = authorizeRoles(['vicerrectorado', 'tecnico_vicerrectorado']);
const upload = require('../middleware/uploadMiddleware');


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

router.put( '/:id', secretariaOnly, convocatoriaController.validateConvocatoria,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }, convocatoriaController.updateConvocatoria );

router.put('/:id/estado', vicerrectorOnly, convocatoriaController.updateEstadoConvocatoria);
router.put('/:id/comentario', vicerrectorOnly, convocatoriaController.updateComentarioObservado);

router.post('/:id/materias', authenticateToken, secretariaOnly, convocatoriaController.addMaterias);
router.post(
  '/:id/archivos',
  authenticateToken,
  secretariaOnly,
  upload.fields([
    { name: 'doc_conv', maxCount: 1 },
    { name: 'resolucion', maxCount: 1 },
    { name: 'dictamen', maxCount: 1 },
  ]),
  convocatoriaController.uploadArchivos
);

module.exports = router;
