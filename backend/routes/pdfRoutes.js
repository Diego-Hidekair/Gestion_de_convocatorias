// backend/routes/pdfRoutes.js 
const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();

const pdfController = require('../controllers/pdfController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const secretariaOnly = authorizeRoles(['secretaria_de_decanatura']);

router.use(authenticateToken);

// Rutas
router.post('/:id/generar', secretariaOnly, pdfController.generatePDF); 
router.post('/:id/combinar', secretariaOnly, pdfController.combinarYGuardarPDFs);
router.post('/:id/upload', secretariaOnly, upload.single('archivo'), pdfController.uploadPDF); 
router.get('/:id/visualizar', pdfController.viewCombinedPDF);
router.get('/:id/descargar', pdfController.downloadCombinedPDF);
router.delete('/:id', secretariaOnly, pdfController.deletePDF);

module.exports = router;
