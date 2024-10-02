// backend/routes/pdfRoutes.js
const express = require('express');
const router = express.Router();
const pdfController = require('../controllers/pdfController');

// Ruta para generar un PDF
router.get('/pdf/generar/:idConvocatoria', pdfController.generatePDF);
module.exports = router;

