// backend/routes/pdfRoutes.js
const express = require('express');
const router = express.Router();
const pdfController = require('../controllers/pdfController');


router.get('/generar/:id_convocatoria/:id_honorario', pdfController.generatePDF);
router.post('/combinar/:id_convocatoria', pdfController.combinePDFs);
//router.put('/combinar/:id_convocatoria', pdfController.combinePDFs);
router.get('/combinado/:id_convocatoria', pdfController.viewCombinedPDF);
router.get('/download/:id_convocatoria', pdfController.downloadCombinedPDF);

module.exports = router;