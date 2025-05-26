// backend/routes/convocatoriaArchivosRoutes.js
const express = require('express');
const router = express.Router();
const archivosController = require('../controllers/convocatoriaArchivosController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const { handleFileUpload } = require('../middleware/uploadMiddleware');
const secretariaOnly = authorizeRoles(['secretaria_de_decanatura']);

const fileFields = [
  { name: 'doc_conv', maxCount: 1 },
  { name: 'resolucion', maxCount: 1 },
  { name: 'dictamen', maxCount: 1 },
  { name: 'carta', maxCount: 1 },
  { name: 'nota', maxCount: 1 },
  { name: 'certificado_item', maxCount: 1 },
  { name: 'certificado_presupuestario', maxCount: 1 }
];

router.get('/:id', authenticateToken, archivosController.getArchivos);
//router.post( '/:id/upload', authenticateToken, secretariaOnly, handleFileUpload(fileFields), archivosController.uploadArchivos);
router.post(
  '/:id/upload',
  authenticateToken,
  secretariaOnly,
  handleFileUpload([
    { name: 'resolucion', maxCount: 1 },
    { name: 'dictamen', maxCount: 1 },
    { name: 'carta', maxCount: 1 },
    { name: 'nota', maxCount: 1 },
    { name: 'certificado_item', maxCount: 1 },
    { name: 'certificado_presupuestario', maxCount: 1 }
  ]),
  archivosController.uploadArchivos
);
router.get('/:id/download/:tipo', authenticateToken, archivosController.downloadArchivo);

module.exports = router;





