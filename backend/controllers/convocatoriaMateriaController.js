// backend/controllers/convocatoriaMateriaController.js
const pool = require('../db');

// Agregar una materia a una convocatoria
const addMateriaToConvocatoria = async (req, res) => {
    const { id_convocatoria, id_materia } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO convocatoria_materia (id_convocatoria, id_materia) VALUES ($1, $2) RETURNING *',
            [id_convocatoria, id_materia]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al agregar materia a la convocatoria:', error);
        res.status(500).json({ error: 'Error al agregar materia a la convocatoria' });
    }
};

// Obtener materias de una convocatoria
const getMateriasByConvocatoria = async (req, res) => {
    const { id_convocatoria } = req.params;
    try {
        const result = await pool.query(
            'SELECT m.* FROM materia m JOIN convocatoria_materia cm ON m.id_materia = cm.id_materia WHERE cm.id_convocatoria = $1',
            [id_convocatoria]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener materias de la convocatoria:', error);
        res.status(500).json({ error: 'Error al obtener materias de la convocatoria' });
    }
};

module.exports = {
    addMateriaToConvocatoria,
    getMateriasByConvocatoria,
};
