// backend/routes/pdfRoutes.js
const express = require('express');
const router = express.Router();
const pdfController = require('../controllers/pdfController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const secretariaOnly = authorizeRoles(['secretaria_de_decanatura']);

router.use(authenticateToken);

// Rutas mejor organizadas
router.post('/:id/generar', secretariaOnly, pdfController.generatePDF); // POST /pdf/57/generar
router.post('/:id/combinar', secretariaOnly, pdfController.combinarYGuardarPDFs);
router.get('/:id/visualizar', pdfController.viewCombinedPDF); // GET /pdf/57/visualizar
router.get('/:id/descargar', pdfController.downloadCombinedPDF);
router.delete('/:id', secretariaOnly, pdfController.deletePDF);

module.exports = router;