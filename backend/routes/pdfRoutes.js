// backend/routes/pdfRoutes.js
const express = require('express');
const router = express.Router();
const pdfController = require('../controllers/pdfController');
const { authenticateToken, verificarRolSecretaria } = require('../middleware/authMiddleware');

router.get('/generar/:id_convocatoria/:id_honorario', authenticateToken, verificarRolSecretaria, pdfController.generatePDF); 
router.get('/combinado/:id_convocatoria', authenticateToken, pdfController.viewCombinedPDF); 
router.get('/download/:id_convocatoria', authenticateToken, pdfController.downloadCombinedPDF); 
router.get('/combinar/:id_convocatoria', authenticateToken, pdfController.combinePDFs); 

module.exports = router;
