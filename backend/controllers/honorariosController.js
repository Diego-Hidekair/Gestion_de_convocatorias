// backend/controllers/honorariosController.js

const pool = require('../db');

// Obtener todos los honorarios
const getHonorarios = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT h.id_honorario, h.id_convocatoria, h.id_tipoconvocatoria, h.pago_mensual,
                   c.nombre AS nombre_convocatoria, 
                   tc.nombre_convocatoria AS nombre_tipoconvocatoria
            FROM honorarios h
            LEFT JOIN convocatorias c ON h.id_convocatoria = c.id_convocatoria
            LEFT JOIN tipo_convocatoria tc ON h.id_tipoconvocatoria = tc.id_tipoconvocatoria
            ORDER BY h.id_honorario
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Obtener un honorario por ID
const getHonorarioById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
            SELECT h.id_honorario, h.id_convocatoria, h.id_tipoconvocatoria, h.pago_mensual,
                   c.nombre AS nombre_convocatoria, 
                   tc.nombre_convocatoria AS nombre_tipoconvocatoria
            FROM honorarios h
            LEFT JOIN convocatorias c ON h.id_convocatoria = c.id_convocatoria
            LEFT JOIN tipo_convocatoria tc ON h.id_tipoconvocatoria = tc.id_tipoconvocatoria
            WHERE h.id_honorario = $1
        `, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Honorario no encontrado' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Crear un nuevo honorario
const createHonorario = async (req, res) => {
    try {
        const { id_convocatoria, id_tipoconvocatoria, pago_mensual } = req.body;
        const result = await pool.query(
            'INSERT INTO honorarios (id_convocatoria, id_tipoconvocatoria, pago_mensual) VALUES ($1, $2, $3) RETURNING id_honorario',
            [id_convocatoria, id_tipoconvocatoria, pago_mensual]
        );
        res.json(result.rows[0]); // Esto devolverá el id_honorario recién creado
    } catch (error) {
        console.error('Error creating honorario:', error);
        res.status(500).send('Server error');
    }
};

// Actualizar un honorario existente
const updateHonorario = async (req, res) => {
    const { id } = req.params;
    const { id_convocatoria, id_tipoconvocatoria, pago_mensual } = req.body;
    try {
        const result = await pool.query(
            'UPDATE honorarios SET id_convocatoria = $1, id_tipoconvocatoria = $2, pago_mensual = $3 WHERE id_honorario = $4 RETURNING *',
            [id_convocatoria, id_tipoconvocatoria, pago_mensual, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Honorario no encontrado' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Eliminar un honorario
const deleteHonorario = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM honorarios WHERE id_honorario = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Honorario no encontrado' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getHonorarios, getHonorarioById, createHonorario, updateHonorario, deleteHonorario };
