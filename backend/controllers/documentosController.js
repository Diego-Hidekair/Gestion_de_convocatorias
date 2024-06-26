// backend/controllers/documentosController.js
const pool = require('../db');
const multer = require('multer');
const path = require('path');

// Configurar multer para la subida de archivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');  // Asegúrate de que este directorio exista
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));  // Nombre único para evitar colisiones
    }
});

const upload = multer({ storage: storage });

// Crear un nuevo documento
const createDocumento = async (req, res) => {
    const { resolucion, dictamen } = req.body;
    const documentoFile = req.file ? req.file.path : null;

    try {
        const result = await pool.query(
            'INSERT INTO documentos (resolucion, dictamen, documento_path) VALUES ($1, $2, $3) RETURNING *',
            [resolucion, dictamen, documentoFile]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error al crear documento:', err);
        res.status(500).json({ error: err.message });
    }
};

// Obtener todos los documentos
const getDocumentos = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM documentos');
        res.json(result.rows);
    } catch (err) {
        console.error('Error al obtener documentos:', err);
        res.status(500).json({ error: err.message });
    }
};

// Exportar controladores y middleware
module.exports = {
    upload,
    createDocumento,
    getDocumentos
};
