// backend/routes/convocatoriasDocumentosRoutes.js

const express = require('express');
const router = express.Router();
const convocatoriasDocumentosController = require('../controllers/convocatoriasDocumentos');
const { upload } = convocatoriasDocumentosController;

// Middleware de multer primero
router.post('/uploadDocument', upload, convocatoriasDocumentosController.uploadDocument);

// Otras rutas
router.get('/:id_convocatoria', convocatoriasDocumentosController.getDocuments);
router.get('/:id_convocatoria/:fieldname', convocatoriasDocumentosController.downloadDocument);

module.exports = router;


