// backend/routes/pdfRoutes.js
const express = require('express');
const router = express.Router();
const pdfController = require('../controllers/pdfController');

router.get('/generar/:id_convocatoria/:id_honorario', authenticateToken, pdfController.generatePDF); 
router.get('/combinado/:id_convocatoria', authenticateToken, pdfController.viewCombinedPDF); 
router.get('/download/:id_convocatoria', authenticateToken, pdfController.downloadCombinedPDF); 
router.put('/combinar/:id_convocatoria', authenticateToken, pdfController.combinePDFs);

module.exports = router;
