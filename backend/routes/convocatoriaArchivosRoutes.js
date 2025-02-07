const express = require('express');
const router = express.Router();
const convocatoriaArchivosController = require('../controllers/convocatoriaArchivosController');
const upload = require('../middlewares/upload');

router.post('/:id_convocatoria/guardar-documentos', upload.fields([
    { name: 'resolucion', maxCount: 1 },
    { name: 'dictamen', maxCount: 1 },
    { name: 'carta', maxCount: 1 },
    { name: 'nota', maxCount: 1 },
    { name: 'certificado_item', maxCount: 1 },
    { name: 'certificado_resumen_presupuestario', maxCount: 1 }
]), convocatoriaArchivosController.guardarDocumentosAdicionales);

module.exports = router;