const express = require('express');
const router = express.Router();
const pool = require('../db');
const multer = require('multer');
const path = require('path');

// Configuración de almacenamiento de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

// Obtener todos los documentos
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM documentos');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener documentos' });
  }
});

// Crear un nuevo documento
router.post('/', upload.fields([
  { name: 'resolucion', maxCount: 1 },
  { name: 'dictamen', maxCount: 1 },
  { name: 'carta', maxCount: 1 }
]), async (req, res) => {
  const { resolucion, dictamen, carta } = req.files;
  const resolucionPath = resolucion ? resolucion[0].path : null;
  const dictamenPath = dictamen ? dictamen[0].path : null;
  const cartaPath = carta ? carta[0].path : null;

  try {
    const result = await pool.query(
      'INSERT INTO documentos (resolucion_path, dictamen_path, carta_path) VALUES ($1, $2, $3) RETURNING *',
      [resolucionPath, dictamenPath, cartaPath]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear documento' });
  }
});

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
  const { resolucion, dictamen, carta } = req.files;
  const resolucionPath = resolucion ? resolucion[0].path : null;
  const dictamenPath = dictamen ? dictamen[0].path : null;
  const cartaPath = carta ? carta[0].path : null;

  try {
    const result = await pool.query(
      'UPDATE documentos SET resolucion_path = $1, dictamen_path = $2, carta_path = $3 WHERE id = $4 RETURNING *',
      [resolucionPath, dictamenPath, cartaPath, id]
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
