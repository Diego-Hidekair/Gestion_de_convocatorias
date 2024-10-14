//backend/controllers/facultadController.js
const pool = require('../db');

const getFacultades = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM facultad ORDER BY nombre_facultad');
        res.json(result.rows);
    } catch (error) {
        res.status(500).send('Error al obtener facultades');
    }
};

const createFacultad = async (req, res) => {
    const { nombre_facultad } = req.body;
    try {
        const result = await pool.query('INSERT INTO facultad (nombre_facultad) VALUES ($1) RETURNING *', [nombre_facultad]);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateFacultad = async (req, res) => {
    const { id } = req.params;
    const { nombre_facultad } = req.body;
    try {
        const result = await pool.query('UPDATE facultad SET nombre_facultad = $1 WHERE id_facultad = $2 RETURNING *', [nombre_facultad, id]);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteFacultad = async (req, res) => {
    const { id } = req.params;
    try {
        // Eliminar carreras relacionadas primero
        await pool.query('DELETE FROM carrera WHERE cod_facultad = $1', [id]);

        // Luego eliminar la facultad
        await pool.query('DELETE FROM facultad WHERE id_facultad = $1', [id]);

        res.json({ message: 'Facultad eliminada' });
    } catch (err) {
        console.error('Error al eliminar la facultad:', err);
        res.status(500).json({ error: err.message });
    }
};


const getFacultadById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM facultad WHERE id_facultad = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Facultad no encontrada' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
const getTipoConvocatorias = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT tc.id_tipoconvocatoria, tc.nombre_convocatoria, 
                f.nombre_facultad, c.nombre_carrera
            FROM tipo_convocatoria tc
            INNER JOIN facultad f ON tc.cod_facultad = f.id_facultad
            INNER JOIN carrera c ON tc.cod_carrera = c.id_carrera
            ORDER BY tc.nombre_convocatoria
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


module.exports = {
    getFacultades,
    createFacultad,
    updateFacultad,
    deleteFacultad,
    getFacultadById,
    getTipoConvocatorias
};
