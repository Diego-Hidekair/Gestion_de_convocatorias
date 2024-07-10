// backend/controllers/convocatoriaController.js
const pool = require('../db');

const getConvocatorias = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM convocatorias ORDER BY cod_convocatoria');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Crear una nueva convocatoria
///---------------------------------
const getConvocatoriaById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
            SELECT c.id_convocatoria, c.cod_convocatoria, c.nombre, c.fecha_inicio, c.fecha_fin, 
                   tc.nombre_convocatoria AS tipo_convocatoria, 
                   ca.nombre_carrera AS carrera, 
                   f.nombre_facultad AS facultad
            FROM convocatorias c
            JOIN tipo_convocatoria tc ON c.id_tipoconvocatoria = tc.id_tipoconvocatoria
            JOIN carrera ca ON c.id_carrera = ca.id_carrera
            JOIN facultad f ON c.id_facultad = f.id_facultad
            WHERE c.id_convocatoria = $1
        `, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Convocatoria no encontrada' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Mantén la lógica del controlador de PDF que tenías previamente
const createPdf = async (req, res) => {
    const { id_convocatoria } = req.body;
    try {
        const convocatoria = await pool.query(`
            SELECT c.cod_convocatoria, c.nombre, c.fecha_inicio, c.fecha_fin, 
                   tc.nombre_convocatoria AS tipo_convocatoria, 
                   ca.nombre_carrera AS carrera, 
                   f.nombre_facultad AS facultad
            FROM convocatorias c
            JOIN tipo_convocatoria tc ON c.id_tipoconvocatoria = tc.id_tipoconvocatoria
            JOIN carrera ca ON c.id_carrera = ca.id_carrera
            JOIN facultad f ON c.id_facultad = f.id_facultad
            WHERE c.id_convocatoria = $1
        `, [id_convocatoria]);

        if (convocatoria.rows.length === 0) {
            return res.status(404).json({ error: 'Convocatoria no encontrada' });
        }

        const convocatoriaData = convocatoria.rows[0];
        
        const pdfPath = path.join(__dirname, '../pdfs', `${convocatoriaData.nombre}.pdf`);
        const pdfContent = `
            Código de Convocatoria: ${convocatoriaData.cod_convocatoria}
            Nombre: ${convocatoriaData.nombre}
            Fecha de Inicio: ${convocatoriaData.fecha_inicio.toLocaleDateString()}
            Fecha de Fin: ${convocatoriaData.fecha_fin.toLocaleDateString()}
            Tipo de Convocatoria: ${convocatoriaData.tipo_convocatoria}
            Carrera: ${convocatoriaData.carrera}
            Facultad: ${convocatoriaData.facultad}
        `;

        await generatePDF(pdfPath, pdfContent);
        res.download(pdfPath);
    } catch (error) {
        console.error('Error al generar el PDF:', error);
        res.status(500).json({ error: 'Error al generar el PDF' });
    }
};
////------------------------------------------------------------
/*
const getConvocatoriaById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM convocatorias WHERE id_convocatoria = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Convocatoria no encontrada' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
*/

const createConvocatoria = async (req, res) => {
    const { cod_convocatoria, nombre, fecha_inicio, fecha_fin, id_tipoconvocatoria, id_carrera, id_facultad } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO convocatorias (cod_convocatoria, nombre, fecha_inicio, fecha_fin, id_tipoconvocatoria, id_carrera, id_facultad) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [cod_convocatoria, nombre, fecha_inicio, fecha_fin, id_tipoconvocatoria, id_carrera, id_facultad]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateConvocatoria = async (req, res) => {
    const { id } = req.params;
    const { cod_convocatoria, nombre, fecha_inicio, fecha_fin, id_tipoconvocatoria, id_carrera, id_facultad } = req.body;
    try {
        const result = await pool.query(
            'UPDATE convocatorias SET cod_convocatoria = $1, nombre = $2, fecha_inicio = $3, fecha_fin = $4, id_tipoconvocatoria = $5, id_carrera = $6, id_facultad = $7 WHERE id_convocatoria = $8 RETURNING *',
            [cod_convocatoria, nombre, fecha_inicio, fecha_fin, id_tipoconvocatoria, id_carrera, id_facultad, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Convocatoria no encontrada' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteConvocatoria = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM convocatorias WHERE id_convocatoria = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Convocatoria no encontrada' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getConvocatorias,
    getConvocatoriaById,
    createConvocatoria,
    updateConvocatoria,
    createPdf,
    deleteConvocatoria
};

