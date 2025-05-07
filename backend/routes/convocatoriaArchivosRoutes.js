// backend/routes/convocatoriaArchivosRoutes.js
const express = require('express');
const router = express.Router();
const archivosController = require('../controllers/convocatoriaArchivosController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const secretariaOnly = authorizeRoles(['secretaria_de_decanatura']);

// Subir archivos (PDF, resoluciones, etc.)
router.post(
    '/:id/archivos',
    authenticateToken,
    secretariaOnly,
    upload.fields([
        { name: 'doc_conv', maxCount: 1 },
        { name: 'resolucion', maxCount: 1 },
        { name: 'dictamen', maxCount: 1 }
    ]),
    archivosController.uploadArchivos
);

// Descargar archivos
router.get('/:id/archivos/:tipo', authenticateToken, archivosController.downloadArchivo);

module.exports = router;