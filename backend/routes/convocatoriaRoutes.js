// backend/routes/convocatoriaRoutes.js
const express = require('express');
const router = express.Router();
const convocatoriaController = require('../controllers/convocatoriaController');
const { authenticateToken, verificarRolSecretaria } = require('../middleware/authMiddleware');

// Rutas específicas antes de rutas dinámicas
router.get('/facultad', authenticateToken, verificarRolSecretaria, convocatoriaController.getConvocatoriasByFacultad);
router.get('/estado/:estado', authenticateToken, convocatoriaController.getConvocatoriasByEstado);
router.get('/facultad/estado/:estado', authenticateToken, verificarRolSecretaria, convocatoriaController.getConvocatoriasByFacultadAndEstado);

// Rutas dinámicas
router.get('/', authenticateToken, convocatoriaController.getConvocatorias);
router.get('/:id', authenticateToken, convocatoriaController.getConvocatoriaById);
router.post('/', authenticateToken, verificarRolSecretaria, convocatoriaController.createConvocatoria);
router.put('/:id', authenticateToken, verificarRolSecretaria, convocatoriaController.updateConvocatoria);

// Ruta para actualizar solo el estado de una convocatoria
//router.patch('/:id/estado', authenticateToken, convocatoriaController.updateEstadoConvocatoria);
router.patch(
    '/:id/estado', 
    authenticateToken, 
    (req, res, next) => {
        // Middleware condicional basado en el rol
        if (req.user.rol === 'tecnico_vicerrectorado' || req.user.rol === 'vicerrectorado' || req.user.rol === 'admin') {
            next();
        } else {
            res.status(403).json({ error: 'Acceso denegado' });
        }
    },
    convocatoriaController.updateEstadoConvocatoria
);

// Nueva ruta para actualizar comentarios (agregar esta línea)
//router.patch('/:id/comentario', authenticateToken, convocatoriaController.updateComentarioObservado);
router.patch(
    '/:id/comentario', 
    authenticateToken, 
    (req, res, next) => {
        // Middleware condicional basado en el rol
        if (req.user.rol === 'tecnico_vicerrectorado' || req.user.rol === 'vicerrectorado' || req.user.rol === 'admin') {
            next();
        } else {
            res.status(403).json({ error: 'Acceso denegado' });
        }
    },
    convocatoriaController.updateComentarioObservado
);

module.exports = router;


