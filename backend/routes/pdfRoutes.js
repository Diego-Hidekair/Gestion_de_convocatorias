// backend/routes/pdfRoutes.js
const express = require('express');
const router = express.Router();
const pdfController = require('../controllers/pdfController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const secretariaOnly = authorizeRoles(['secretaria_de_decanatura']);

router.use(authenticateToken);

// Rutas actualizadas
router.post('/convocatorias/:id/pdf/generar', secretariaOnly, pdfController.generatePDF);
router.post('/convocatorias/:id/pdf/combinar', secretariaOnly, pdfController.combinarYGuardarPDFs);
router.get('/convocatorias/:id/pdf', pdfController.viewCombinedPDF);
router.get('/convocatorias/:id/pdf/descargar', pdfController.downloadCombinedPDF);
router.delete('/convocatorias/:id/pdf', secretariaOnly, pdfController.deletePDF);

module.exports = router;