// backend/controllers/materiaController.js
const pool = require('../db');

// Obtener todas las materias (solo lectura)
exports.getAllMaterias = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM planes.pln_materias ORDER BY nombre');
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener las materias:', error);
        res.status(500).json({ message: 'Error al obtener las materias' });
    }
};

// Obtener una materia por ID (solo lectura)
exports.getMateriaById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM planes.pln_materias WHERE id_materia = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Materia no encontrada' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener la materia:', error);
        res.status(500).json({ message: 'Error al obtener la materia' });
    }
};
