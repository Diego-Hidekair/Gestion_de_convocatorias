// backend/routes/convocatoriaRoutes.js
const express = require('express');
const router = express.Router();
const convocatoriaController = require('../controllers/convocatoriaController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const { validationResult } = require('express-validator');
const secretariaOnly = authorizeRoles(['secretaria_de_decanatura']);
const vicerrectorOnly = authorizeRoles(['vicerrectorado', 'tecnico_vicerrectorado']);

router.use(authenticateToken);
router.get('/', convocatoriaController.getConvocatorias);
router.get('/facultad/actual', convocatoriaController.getConvocatoriasByFacultad);
router.get('/facultad/estado/:estado', convocatoriaController.getConvocatoriasByFacultadAndEstado);
router.get('/:id', convocatoriaController.getConvocatoriaById);
router.post(
    '/',
    secretariaOnly,
    convocatoriaController.validateConvocatoria,
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
    convocatoriaController.createConvocatoria
);
router.put(
    '/:id',
    secretariaOnly,
    convocatoriaController.validateConvocatoria,
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
    convocatoriaController.updateConvocatoria
);
//router.put('/:id/estado', vicerrectorOnly, convocatoriaController.updateEstadoConvocatoria);
router.put('/:id/comentario', vicerrectorOnly, convocatoriaController.updateComentarioObservado);
//router.patch('/:id/estado', convocatoriaController.updateEstadoConvocatoria);
router.patch('/convocatorias/:id/estado', convocatoriaController.updateEstadoConvocatoria);


module.exports = router;