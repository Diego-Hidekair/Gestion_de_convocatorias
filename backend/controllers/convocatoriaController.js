const pool = require('../db');

// Obtener todas las convocatorias
const getConvocatorias = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM convocatorias ORDER BY fecha_inicio');
        res.json(result.rows);
    } catch (error) {
        res.status(500).send('Error al obtener convocatorias');
    }
};

// Crear una nueva convocatoria
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

// Actualizar una convocatoria existente
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

// Eliminar una convocatoria
const deleteConvocatoria = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM convocatorias WHERE id_convocatoria = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Convocatoria no encontrada' });
        }
        res.json({ message: 'Convocatoria eliminada' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Obtener una convocatoria por ID
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

module.exports = {
    getConvocatorias,
    createConvocatoria,
    updateConvocatoria,
    deleteConvocatoria,
    getConvocatoriaById
};
