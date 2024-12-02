// backend/routes/pdfRoutes.js
const express = require('express');
const router = express.Router();
const pdfController = require('../controllers/pdfController');
const { authenticateToken, verificarRolSecretaria } = require('../middleware/authMiddleware');

router.get('/generar/:id_convocatoria/:id_honorario', authenticateToken, verificarRolSecretaria, pdfController.generatePDF);
//router.get('/combinado/:id_convocatoria', pdfController.viewCombinedPDF); 
router.get( '/combinado/ver/:id_convocatoria', authenticateToken, pdfController.viewCombinedPDF );

//router.get('/download/:id_convocatoria', authenticateToken, pdfController.downloadCombinedPDF); 
router.get('/descargar/:id_convocatoria', pdfController.downloadCombinedPDF);
//router.get('/combinado/descargar/:id_convocatoria', authenticateToken, pdfController.downloadCombinedPDF);

router.delete( '/eliminar/:id_convocatoria', authenticateToken, verificarRolSecretaria, pdfController.deletePDF);

module.exports = router;