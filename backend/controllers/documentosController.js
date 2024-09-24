// backend/controllers/documentosController.js
const pool = require('../db');
const multer = require('multer');
const path = require('path');

// Configurar multer para la subida de archivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'pdfs/');  // Directorio donde se guardarán los archivos
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));  // Nombre único para evitar colisiones
    }
});

const upload = multer({ storage: storage });

// Crear un nuevo documento
const createDocumentos = async (req, res) => {
    const { documento_path, resolucion_path, dictamen_path, carta_path, id_convocatoria } = req.body;
    try {
        const result = await pool.query(`
            INSERT INTO documentos (documento_path, resolucion_path, dictamen_path, carta_path, id_convocatoria) 
            VALUES ($1, $2, $3, $4, $5) RETURNING *
        `, [documento_path, resolucion_path, dictamen_path, carta_path, id_convocatoria]);
        
        res.status(201).json(result.rows[0]);  // Enviar el registro recién creado
    } catch (error) {
        console.error('Error creando documentos:', error);
        res.status(500).json({ error: 'Error en el servidor' });
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

// Subir un documento adicional
const subirDocumentoAdicional = async (req, res) => {
    const { id_convocatoria, descripcion } = req.body;
    const archivo = req.file;

    if (!archivo) {
        return res.status(400).json({ message: 'No se ha subido ningún archivo.' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO documentos_adicionales (id_convocatoria, descripcion, ruta) VALUES ($1, $2, $3) RETURNING *',
            [id_convocatoria, descripcion, archivo.path]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al subir documento adicional:', error);
        res.status(500).json({ message: 'Error al subir el documento adicional' });
    }
};

// Obtener documentos adicionales por convocatoria
const obtenerDocumentosAdicionalesPorConvocatoria = async (req, res) => {
    try {
        const { idConvocatoria } = req.params;

        const result = await pool.query(
            'SELECT * FROM documentos_adicionales WHERE id_convocatoria = $1',
            [idConvocatoria]
        );

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener documentos adicionales:', error);
        res.status(500).json({ message: 'Error al obtener los documentos adicionales' });
    }
};

module.exports = { upload, createDocumentos, getDocumentos, obtenerDocumentosAdicionalesPorConvocatoria, subirDocumentoAdicional };

