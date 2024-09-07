// backend/controllers/convocatoriaMateriaController.js
const pool = require('../db');

// Obtener todas las materias de una convocatoria
const getConvocatoriaMaterias = async (req, res) => {
    try {
        const { id_convocatoria } = req.params;
        const result = await pool.query('SELECT * FROM convocatoria_materia WHERE id_convocatoria = $1', [id_convocatoria]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching convocatoria_materias:', error);
        res.status(500).send('Server error');
    }
};

// Crear una nueva relación convocatoria-materia
const createConvocatoriaMateria = async (req, res) => {
    try {
        const { id_convocatoria, id_materia, total_horas, perfil_profesional } = req.body; // Agregamos los nuevos campos
        const result = await pool.query(
            'INSERT INTO convocatoria_materia (id_convocatoria, id_materia, total_horas, perfil_profesional) VALUES ($1, $2, $3, $4) RETURNING *',
            [id_convocatoria, id_materia, total_horas, perfil_profesional]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error creating convocatoria_materia:', error);
        res.status(500).send('Server error');
    }
};

// Actualizar una relación convocatoria-materia
const updateConvocatoriaMateria = async (req, res) => {
    try {
        const { id } = req.params;
        const { id_convocatoria, id_materia, total_horas, perfil_profesional } = req.body; // Agregamos los nuevos campos
        const result = await pool.query(
            'UPDATE convocatoria_materia SET id_convocatoria = $1, id_materia = $2, total_horas = $3, perfil_profesional = $4 WHERE id = $5 RETURNING *',
            [id_convocatoria, id_materia, total_horas, perfil_profesional, id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating convocatoria_materia:', error);
        res.status(500).send('Server error');
    }
};

// Eliminar una relación convocatoria-materia
const deleteConvocatoriaMateria = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM convocatoria_materia WHERE id = $1', [id]);
        res.send('ConvocatoriaMateria deleted');
    } catch (error) {
        console.error('Error deleting convocatoria_materia:', error);
        res.status(500).send('Server error');
    }
};

module.exports = { getConvocatoriaMaterias, createConvocatoriaMateria, updateConvocatoriaMateria, deleteConvocatoriaMateria };
