// backend/routes/documentosRoutes.js
const express = require('express');
const router = express.Router();
const { 
    upload, 
    createDocumento, 
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
]), createDocumento);

// Subir un documento adicional
router.post('/adicional', upload.single('documento_adicional'), subirDocumentoAdicional);

// Obtener documentos adicionales por convocatoria
router.get('/adicional/:idConvocatoria', obtenerDocumentosAdicionalesPorConvocatoria);

// Obtener un documento por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM documentos WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener documento' });
  }
});

// Actualizar un documento
router.put('/:id', upload.fields([
  { name: 'resolucion', maxCount: 1 },
  { name: 'dictamen', maxCount: 1 },
  { name: 'carta', maxCount: 1 }
]), async (req, res) => {
  const { id } = req.params;
  const { id_convocatoria } = req.body;
  const resolucionPath = req.files['resolucion'] ? req.files['resolucion'][0].path : null;
  const dictamenPath = req.files['dictamen'] ? req.files['dictamen'][0].path : null;
  const cartaPath = req.files['carta'] ? req.files['carta'][0].path : null;

  try {
    const result = await pool.query(
      'UPDATE documentos SET resolucion_path = $1, dictamen_path = $2, carta_path = $3, id_convocatoria = $4 WHERE id = $5 RETURNING *',
      [resolucionPath, dictamenPath, cartaPath, id_convocatoria, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar documento' });
  }
});

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
