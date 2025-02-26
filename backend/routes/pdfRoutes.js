// backend/routes/pdfRoutes.js
const express = require('express');
const router = express.Router();
const pdfController = require('../controllers/pdfController');
const { authenticateToken, verificarRolSecretaria } = require('../middleware/authMiddleware');

router.get('/generar/:id_convocatoria/:id_honorario', authenticateToken, verificarRolSecretaria, pdfController.generatePDF);
router.get('/combinado/ver/:id_convocatoria', authenticateToken, verificarRolSecretaria, pdfController.viewCombinedPDF);
router.post('/combinar-y-guardar/:id_convocatoria', authenticateToken, verificarRolSecretaria, pdfController.combinarYGuardarPDFs);
router.get('/descargar/:id_convocatoria', pdfController.downloadCombinedPDF);
router.delete('/eliminar/:id_convocatoria', authenticateToken, verificarRolSecretaria, pdfController.deletePDF);

module.exports = router;
