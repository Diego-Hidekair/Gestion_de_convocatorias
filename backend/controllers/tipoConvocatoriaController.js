// backend/controllers/tipoConvocatoriaController.js
const pool = require('../db');

const getTipoConvocatorias = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT tc.*, f.nombre_facultad, c.nombre_carrera
             FROM tipo_convocatoria tc
             LEFT JOIN facultad f ON tc.cod_facultad = f.id_facultad
             LEFT JOIN carrera c ON tc.cod_carrera = c.id_carrera
             ORDER BY tc.nombre_convocatoria`
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createTipoConvocatoria = async (req, res) => {
    const { nombre_convocatoria, cod_carrera, cod_facultad } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO tipo_convocatoria (nombre_convocatoria, cod_carrera, cod_facultad) VALUES ($1, $2, $3) RETURNING *',
            [nombre_convocatoria, cod_carrera, cod_facultad]
        );
        res.status(201).json(result.rows[0]); // Cambio a status 201 (Created)
    } catch (err) {
        console.error('Error al crear tipo de convocatoria:', err);
        res.status(500).json({ error: err.message });
    }
};

const updateTipoConvocatoria = async (req, res) => {
    const { id } = req.params;
    const { nombre_convocatoria, cod_carrera, cod_facultad } = req.body;
    try {
        const result = await pool.query(
            'UPDATE tipo_convocatoria SET nombre_convocatoria = $1, cod_carrera = $2, cod_facultad = $3 WHERE id_tipoconvocatoria = $4 RETURNING *',
            [nombre_convocatoria, cod_carrera, cod_facultad, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Tipo de convocatoria no encontrada' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error al actualizar tipo de convocatoria:', err);
        res.status(500).json({ error: err.message });
    }
};

const deleteTipoConvocatoria = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM tipo_convocatoria WHERE id_tipoconvocatoria = $1', [id]);
        res.json({ message: 'Tipo de convocatoria eliminada' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


const getTipoConvocatoriaById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM tipo_convocatoria WHERE id_tipoconvocatoria = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Tipo de convocatoria no encontrada' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getTipoConvocatorias,
    createTipoConvocatoria,
    updateTipoConvocatoria,
    deleteTipoConvocatoria,
    getTipoConvocatoriaById
};
