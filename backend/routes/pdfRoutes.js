// backend/routes/pdfRoutes.js 
const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();

const pdfController = require('../controllers/pdfController'); // Importas todo el controlador
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const secretariaOnly = authorizeRoles(['secretaria_de_decanatura']);

router.use(authenticateToken);

router.post('/:id/generar', secretariaOnly, pdfController.generatePDF);
router.get('/:id/ver', pdfController.viewPDF);
router.get('/:id/descargar', pdfController.downloadPDF);
router.delete('/:id/eliminar', secretariaOnly, pdfController.deletePDF);
router.post('/:id/subir', secretariaOnly, upload.single('archivo'), pdfController.uploadPDF);
router.get('/debug/:id', pdfController.debugPDF);

module.exports = router;