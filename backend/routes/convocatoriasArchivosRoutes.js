// backend/controllers/convocatoriaArchivosaRoutes.js
const express = require('express');
const router = express.Router();
const convocatoriasArchivosController = require('../controllers/convocatoriasArchivosController');

// Subir documentos adicionales
router.post('/:id_convocatoria/subir-documentos', convocatoriasArchivosController.subirDocumentosAdicionales);

// Obtener documentos adicionales
router.get('/:id_convocatoria/documentos', convocatoriasArchivosController.obtenerDocumentosAdicionales);

// Eliminar documentos adicionales
router.delete('/:id_convocatoria/documentos', convocatoriasArchivosController.eliminarDocumentosAdicionales);

module.exports = router;