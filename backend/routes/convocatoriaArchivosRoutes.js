// backend/routes/convocatoriaArchivosRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const archivosController = require('../controllers/convocatoriaArchivosController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const secretariaOnly = authorizeRoles(['secretaria_de_decanatura']);
const vicerrectorOnly = authorizeRoles(['vicerrectorado', 'tecnico_vicerrectorado']);

const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
        files: 6
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/png'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de archivo no permitido'), false);
        }
    }
});
router.get('/:id/generar-pdf', authenticateToken, secretariaOnly, archivosController.generateConvocatoriaPDF);
router.get('/:id/archivos', authenticateToken, archivosController.getConvocatoriaFiles);
router.get('/:id/descargar/:fileType', archivosController.downloadConvocatoriaFile);
router.get('/:id/ver-pdf/:fileType', archivosController.viewConvocatoriaPDF); 
router.post('/:id/archivos', authenticateToken, secretariaOnly, upload.fields([
        { name: 'resolucion', maxCount: 1 },
        { name: 'dictamen', maxCount: 1 },
        { name: 'carta', maxCount: 1 },
        { name: 'nota', maxCount: 1 },
        { name: 'certificado_item', maxCount: 1 },
        { name: 'certificado_presupuestario', maxCount: 1 }
    ]),
    archivosController.uploadConvocatoriaFiles
);

module.exports = router;
