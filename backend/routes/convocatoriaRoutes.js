// backend/routes/convocatoriaRoutes.js
const express = require('express');
const router = express.Router();
const convocatoriaController = require('../controllers/convocatoriaController');
const pdfController = require('../controllers/pdfController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const secretariaOnly = authorizeRoles(['secretaria_de_decanatura']);
const vicerrectorOnly = authorizeRoles(['vicerrectorado', 'tecnico_vicerrectorado']);
const adminOnly = authorizeRoles(['admin']);

router.use(authenticateToken);

// Rutas de convocatorias
router.get('/', convocatoriaController.getConvocatorias);
router.get('/facultad/actual', convocatoriaController.getConvocatoriasByFacultad);
router.get('/facultad/estado/:estado', convocatoriaController.getConvocatoriasByFacultadAndEstado);
router.get('/:id', convocatoriaController.getConvocatoriaById);
router.post('/', secretariaOnly, convocatoriaController.validateConvocatoria, convocatoriaController.createConvocatoria);
router.put('/:id', secretariaOnly, convocatoriaController.validateConvocatoria, convocatoriaController.updateConvocatoria);
router.put('/:id/estado', vicerrectorOnly, convocatoriaController.updateEstadoConvocatoria);
router.put('/:id/comentario', vicerrectorOnly, convocatoriaController.updateComentarioObservado);

// Rutas de PDF (asegúrate de que los nombres coincidan con el controlador)
//router.post('/:id/pdf/generar', secretariaOnly, pdfController.generatePDF);
router.post('/:id/pdf/generar', secretariaOnly, (req, res, next) => {
  console.log('pdfController:', pdfController);
  console.log('generatePDF:', pdfController.generatePDF); 
  pdfController.generatePDF(req, res, next);
});

router.post('/:id/pdf/combinar', secretariaOnly, pdfController.combineAndSavePDFs);
router.get('/:id/pdf', pdfController.viewCombinedPDF);
router.get('/:id/pdf/descargar', pdfController.downloadPDF);
router.delete('/:id/pdf', secretariaOnly, pdfController.deletePDF);

module.exports = router;