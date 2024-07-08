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
    const { codigomateria, nombre, id_carrera } = req.body;
    if (!codigomateria || !nombre || !id_carrera) {
        return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO materia (codigomateria, nombre, id_carrera) VALUES ($1, $2, $3) RETURNING *',
            [codigomateria, nombre, id_carrera]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al crear la materia:', error);
        res.status(500).json({ message: 'Error al crear la materia' });
    }
};

// Actualizar una materia por ID
exports.updateMateria = async (req, res) => {
    const { id } = req.params;
    const { codigomateria, nombre, id_carrera } = req.body;

    try {
        const result = await pool.query(
            'UPDATE materia SET codigomateria = $1, nombre = $2, id_carrera = $3 WHERE id_materia = $4 RETURNING *',
            [codigomateria, nombre, id_carrera, id]
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

//module.exports = {getAllMaterias, getMateriaById, createMateria, updateMateria, deleteMateria };