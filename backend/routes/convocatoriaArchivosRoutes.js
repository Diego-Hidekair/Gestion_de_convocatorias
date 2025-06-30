// backend/routes/convocatoriaArchivosRoutes.js
const express = require('express');
const multer = require('multer');

const archivos = require('../controllers/convocatoriaArchivosController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const secretariaOnly = authorizeRoles(['secretaria_de_decanatura']);

const router = express.Router();
router.use(authenticateToken);

const uploadMultiple = multer({ storage: multer.memoryStorage() }).fields([
  { name: 'resolucion' },
  { name: 'dictamen' },
  { name: 'carta' },
  { name: 'nota' },
  { name: 'certificado_item' },
  { name: 'certificado_presupuestario' },
]);

router.get('/:id/archivos', archivos.obtenerInfoArchivos);
router.post('/:id/generar', secretariaOnly, archivos.generateConvocatoriaPDF);
router.get('/:id/ver', archivos.viewConvocatoriaPDF);
router.post('/:id/subir/:tipo', secretariaOnly, archivos.uploadFileByType, archivos.handleUploadByType);
router.get('/:id/ver-pdf/:tipo', archivos.viewPDFbyType);
router.get('/:id/descargar/:tipo', archivos.downloadPDFbyType);
router.delete('/:id/eliminar/:tipo', secretariaOnly, archivos.deleteFileByType);
router.post('/:id/subir-multiples', secretariaOnly, uploadMultiple, archivos.handleMultipleUploads);

module.exports = router;
