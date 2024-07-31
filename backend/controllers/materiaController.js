// backend/controllers/materiaController.js
const pool = require('../db');

// Obtener todas las materias
exports.getAllMaterias = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM materia');
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener las materias:', error);
        res.status(500).json({ message: 'Error al obtener las materias' });
    }
};

// Obtener una materia por ID
exports.getMateriaById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM materia WHERE id_materia = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Materia no encontrada' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener la materia:', error);
        res.status(500).json({ message: 'Error al obtener la materia' });
    }
};

// Crear una nueva materia
exports.createMateria = async (req, res) => {
    try {
        const { codigomateria, nombre, id_carrera, horas_teoria, horas_practica, horas_laboratorio } = req.body;
        const result = await pool.query(
            'INSERT INTO materia (codigomateria, nombre, id_carrera, horas_teoria, horas_practica, horas_laboratorio) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [codigomateria, nombre, id_carrera, horas_teoria, horas_practica, horas_laboratorio]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al crear la materia:', error);
        res.status(500).json({ error: 'Error al crear la materia' });
    }
};

// Actualizar una materia por ID
exports.updateMateria = async (req, res) => {
    const { id } = req.params;
    const { codigomateria, nombre, horas_teoria, horas_practica, horas_laboratorio, id_carrera } = req.body;

    try {
        const result = await pool.query(
            'UPDATE materia SET codigomateria = $1, nombre = $2, horas_teoria = $3, horas_practica = $4, horas_laboratorio = $5, id_carrera = $6 WHERE id_materia = $7 RETURNING *',
            [codigomateria, nombre, horas_teoria, horas_practica, horas_laboratorio, id_carrera, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Materia no encontrada' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al actualizar la materia:', error);
        res.status(500).json({ message: 'Error al actualizar la materia' });
    }
};

// Eliminar una materia por ID
exports.deleteMateria = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('DELETE FROM materia WHERE id_materia = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Materia no encontrada' });
        }
        res.json({ message: 'Materia eliminada' });
    } catch (error) {
        console.error('Error al eliminar la materia:', error);
        res.status(500).json({ message: 'Error al eliminar la materia' });
    }
};
