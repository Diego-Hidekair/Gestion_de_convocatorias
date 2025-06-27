// backend/routes/convocatoriaArchivosRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const archivosController = require('../controllers/convocatoriaArchivosController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const secretariaOnly = authorizeRoles(['secretaria_de_decanatura']);

const storage = multer.memoryStorage();
const upload = multer({ 
    storage,
    limits: { fileSize: 10 * 1024 * 1024, files: 6 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/png'
        ];
        cb(null, allowedTypes.includes(file.mimetype));
    }
});

router.use(authenticateToken);

router.get('/:id/archivos', archivosController.getConvocatoriaFiles);

router.get('/:id/descargar/:tipo', archivosController.downloadPDFbyType);

router.get('/:id/ver-pdf/:tipo', archivosController.viewPDFbyType);

router.post('/:id/subir-multiple', secretariaOnly, upload.fields([
    { name: 'resolucion', maxCount: 1 },
    { name: 'dictamen', maxCount: 1 },
    { name: 'carta', maxCount: 1 },
    { name: 'nota', maxCount: 1 },
    { name: 'certificado_item', maxCount: 1 },
    { name: 'certificado_presupuestario', maxCount: 1 }
]), archivosController.uploadConvocatoriaFiles);


router.delete('/:id/eliminar/:tipo', secretariaOnly, archivosController.deleteFileByType);

module.exports = router;
