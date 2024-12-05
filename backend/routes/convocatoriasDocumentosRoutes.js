// backend/routes/convocatoriasDocumentosRoutes.js

const express = require('express');
const router = express.Router();
const convocatoriasDocumentosController = require('../controllers/convocatoriasDocumentos');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

// Ruta para subir un documento
router.post(
    '/upload',
    upload.single('file'),
    convocatoriasDocumentosController.uploadDocument
);

// Ruta para obtener documentos de una convocatoria
router.get('/:id_convocatoria', convocatoriasDocumentosController.getDocuments);

// Ruta para descargar un documento específico
router.get('/:id_convocatoria/:fieldname', convocatoriasDocumentosController.downloadDocument);

module.exports = router;
