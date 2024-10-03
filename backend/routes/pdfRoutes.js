// backend/routes/pdfRoutes.js
const express = require('express');
const router = express.Router();
const pdfController = require('../controllers/pdfController');

// Ruta para generar un PDF
router.get('/generar/:id_convocatoria/:id_honorario', pdfController.generatePDF);  // Corregido aquí


module.exports = router;
