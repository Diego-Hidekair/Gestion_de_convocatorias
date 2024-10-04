// backend/routes/pdfRoutes.js
const express = require('express');
const router = express.Router();
const pdfController = require('../controllers/pdfController');

// Ruta para generar un PDF
router.get('/generar/:id_convocatoria/:id_honorario', pdfController.generatePDF);

// Nueva ruta para combinar los PDFs
router.post('/combinar/:id_convocatoria', pdfController.combinePDFs);

// Nueva ruta para ver el PDF combinado
router.get('/combinado/:id_convocatoria', pdfController.viewCombinedPDF);

module.exports = router;

 