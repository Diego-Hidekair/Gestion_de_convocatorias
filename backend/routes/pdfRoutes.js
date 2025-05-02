// backend/routes/pdfRoutes.js
const express = require('express');
const router = express.Router();
const pdfController = require('../controllers/pdfController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const secretariaOnly = authorizeRoles(['secretaria_de_decanatura']);

router.use(authenticateToken);

// Rutas de PDF
router.post('/:id/pdf/generar', secretariaOnly, pdfController.generatePDF);
router.post('/:id/pdf/combinar', secretariaOnly, pdfController.combinarYGuardarPDFs);
router.get('/:id/pdf', pdfController.viewCombinedPDF);
router.get('/:id/pdf/descargar', pdfController.downloadCombinedPDF);
router.delete('/:id/pdf', secretariaOnly, pdfController.deletePDF);

module.exports = router;