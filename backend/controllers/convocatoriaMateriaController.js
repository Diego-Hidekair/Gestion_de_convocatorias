// backend/controllers/convocatoriaMateriaController.js
const pool = require('../db');

const getConvocatoriaMaterias = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM convocatoria_materia');
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener convocatoria_materia:', error);
        res.status(500).send('Error al obtener convocatoria_materia');
    }
};

const createConvocatoriaMateria = async (req, res) => {
    const { id_convocatoria, id_materia } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO convocatoria_materia (id_convocatoria, id_materia) VALUES ($1, $2) RETURNING *',
            [id_convocatoria, id_materia]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error al crear convocatoria_materia:', err);
        res.status(500).json({ error: err.message });
    }
};

const deleteConvocatoriaMateria = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM convocatoria_materia WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'ConvocatoriaMateria no encontrada' });
        }
        res.json({ message: 'ConvocatoriaMateria eliminada' });
    } catch (err) {
        console.error('Error al eliminar convocatoria_materia:', err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getConvocatoriaMaterias,
    createConvocatoriaMateria,
    deleteConvocatoriaMateria
};
