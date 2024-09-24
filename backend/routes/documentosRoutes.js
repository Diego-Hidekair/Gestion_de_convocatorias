// backend/routes/documentosRoutes.js
const express = require('express');
const router = express.Router();

const { 
    upload,  // Ya importas upload desde documentosController.js
    createDocumentos, 
    getDocumentos, 
    obtenerDocumentosAdicionalesPorConvocatoria, 
    subirDocumentoAdicional 
} = require('../controllers/documentosController');

// Obtener todos los documentos
router.get('/', getDocumentos);

// Crear un nuevo documento
router.post('/', upload.fields([
  { name: 'resolucion', maxCount: 1 },
  { name: 'dictamen', maxCount: 1 },
  { name: 'carta', maxCount: 1 }
]), createDocumentos);

// Subir un documento adicional
router.post('/adicional', upload.single('documento_adicional'), subirDocumentoAdicional);

// Obtener documentos adicionales por convocatoria
router.get('/adicional/:idConvocatoria', obtenerDocumentosAdicionalesPorConvocatoria);

// Eliminar un documento
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM documentos WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }
    res.json({ message: 'Documento eliminado', document: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar documento' });
  }
});

module.exports = router;