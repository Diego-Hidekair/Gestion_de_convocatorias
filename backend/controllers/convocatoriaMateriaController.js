// backend/controllers/convocatoriaMateriaController.js
const pool = require('../db');

// Obtener todas las materias asociadas a una convocatoria
const getConvocatoriaMaterias = async (req, res) => {
    const { id_convocatoria } = req.params;
    try {
        const result = await pool.query(`
            SELECT cm.id, cm.total_horas, cm.perfil_profesional, 
                   m.nombre AS nombre_materia,
                   c.nombre AS nombre_convocatoria
            FROM convocatoria_materia cm
            JOIN materia m ON cm.id_materia = m.id_materia
            JOIN convocatorias c ON cm.id_convocatoria = c.id_convocatoria
            WHERE cm.id_convocatoria = $1
        `, [id_convocatoria]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No se encontraron materias para esta convocatoria' });
        }
        
        res.json(result.rows);
    } catch (error) {
        console.error('Error buscando convocatoria_materias:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

// Obtener una relación convocatoria-materia específica por id_convocatoria y id_materia
const getConvocatoriaMateriaById = async (req, res) => {
    const { id_convocatoria, id_materia } = req.params;
    try {
        const result = await pool.query(`
            SELECT cm.id, cm.total_horas, cm.perfil_profesional, 
                   m.nombre AS nombre_materia,
                   c.nombre AS nombre_convocatoria
            FROM convocatoria_materia cm
            JOIN materia m ON cm.id_materia = m.id_materia
            JOIN convocatorias c ON cm.id_convocatoria = c.id_convocatoria
            WHERE cm.id_convocatoria = $1 AND cm.id_materia = $2
        `, [id_convocatoria, id_materia]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Relación convocatoria-materia no encontrada' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error buscando convocatoria_materia por ID:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

// Crear una nueva relación convocatoria-materia
const createConvocatoriaMateria = async (req, res) => {
    const { id_convocatoria, id_materia, perfil_profesional } = req.body;
    try {
        const result = await pool.query(`
            INSERT INTO convocatoria_materia (id_convocatoria, id_materia, perfil_profesional) 
            VALUES ($1, $2, $3) RETURNING *
        `, [id_convocatoria, id_materia, perfil_profesional]);
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creando convocatoria_materia:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

// Actualizar una relación convocatoria-materia específica por id_convocatoria y id_materia
const updateConvocatoriaMateria = async (req, res) => {
    const { id_convocatoria, id_materia } = req.params;
    const { perfil_profesional } = req.body;
    try {
        const result = await pool.query(`
            UPDATE convocatoria_materia 
            SET perfil_profesional = $1 
            WHERE id_convocatoria = $2 AND id_materia = $3 RETURNING *
        `, [perfil_profesional, id_convocatoria, id_materia]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Relación convocatoria-materia no encontrada' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error actualizando convocatoria_materia:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

// Eliminar una relación convocatoria-materia
const deleteConvocatoriaMateria = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM convocatoria_materia WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Relación convocatoria-materia no encontrada' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error eliminando convocatoria_materia:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

module.exports = { getConvocatoriaMaterias, getConvocatoriaMateriaById, createConvocatoriaMateria, updateConvocatoriaMateria, deleteConvocatoriaMateria };
