// backend/controllers/convocatoriasDocumentos.js
const { Pool } = require('pg');
const multer = require('multer');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});
 
// Configuración de multer para subir archivos en memoria
const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'application/pdf') {
            return cb(new Error('Solo se permiten archivos PDF.'));
        }
        cb(null, true);
    },
}).fields([
    { name: 'resolucion', maxCount: 1 },
    { name: 'dictamen', maxCount: 1 },
    { name: 'carta', maxCount: 1 },
    { name: 'convocatoria', maxCount: 1 }
]);
// Subir documentos
exports.uploadDocument = async (req, res) => {
    console.log('Body:', req.body);
    console.log('Files:', req.files);
    try {
        const { id_convocatoria, id_documentos } = req.body;
        const validFields = [
            'convocatoria', 'resolucion', 'dictamen', 'carta',
            'nota', 'certificado_item', 'certificado_resumen_presupuestario'
        ];

        // Validar parámetros
        if (!id_convocatoria || !id_documentos) {
            return res.status(400).json({ error: "Se requiere id_convocatoria e id_documentos." });
        }
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({ error: "No se encontraron archivos para subir." });
        }

        // Obtener el nombre del campo y el archivo
        const fieldname = Object.keys(req.files)[0];
        const file = req.files[fieldname][0];

        if (!validFields.includes(fieldname)) {
            return res.status(400).json({ error: `Campo no válido: ${fieldname}.` });
        }

        const buffer = file.buffer;

        // Verificar si ya existe el registro
        const existingRecord = await pool.query(
            `SELECT * FROM convocatorias_archivos WHERE id_convocatoria = $1`,
            [id_convocatoria]
        );

        if (existingRecord.rowCount === 0) {
            // Insertar registro inicial si no existe
            await pool.query(
                `INSERT INTO convocatorias_archivos (id_convocatoria, id_documentos) VALUES ($1, $2)`,
                [id_convocatoria, id_documentos]
            );
        }

        // Actualizar el archivo en la columna correspondiente
        const query = `
            UPDATE convocatorias_archivos
            SET ${fieldname} = $1
            WHERE id_convocatoria = $2 AND id_documentos = $3
        `;
        await pool.query(query, [buffer, id_convocatoria, id_documentos]);

        res.status(200).json({ message: `Archivo subido correctamente al campo ${fieldname}.` });
    } catch (error) {
        console.error('Error al subir el documento:', error);
        res.status(500).json({ error: "Error al subir el documento." });
    }
};

// Ver documentos de una convocatoria
exports.getDocuments = async (req, res) => {
    try {
        const { id_convocatoria } = req.params;

        const result = await pool.query(
            `SELECT * FROM convocatorias_archivos WHERE id_convocatoria = $1`,
            [id_convocatoria]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "No se encontraron documentos para esta convocatoria." });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener documentos:', error);
        res.status(500).json({ error: "Error al obtener documentos." });
    }
};

// Descargar un documento específico
exports.downloadDocument = async (req, res) => {
    try {
        const { id_convocatoria, fieldname } = req.params;
        const validFields = [
            'convocatoria', 'resolucion', 'dictamen', 'carta',
            'nota', 'certificado_item', 'certificado_resumen_presupuestario'
        ];

        if (!validFields.includes(fieldname)) {
            return res.status(400).json({ error: `Campo no válido: ${fieldname}.` });
        }

        const result = await pool.query(
            `SELECT ${fieldname} FROM convocatorias_archivos WHERE id_convocatoria = $1`,
            [id_convocatoria]
        );

        if (result.rowCount === 0 || !result.rows[0][fieldname]) {
            return res.status(404).json({ error: "Documento no encontrado." });
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.send(result.rows[0][fieldname]);
    } catch (error) {
        console.error('Error al descargar el documento:', error);
        res.status(500).json({ error: "Error al descargar el documento." });
    }
};

module.exports.upload = upload;

