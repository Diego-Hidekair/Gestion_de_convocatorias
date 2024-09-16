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

// Obtener una materia asociada a una convocatoria por ID
const getConvocatoriaMateriaById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
            SELECT cm.id, cm.total_horas, cm.perfil_profesional, 
                   m.nombre AS nombre_materia,
                   c.nombre AS nombre_convocatoria
            FROM convocatoria_materia cm
            JOIN materia m ON cm.id_materia = m.id_materia
            JOIN convocatorias c ON cm.id_convocatoria = c.id_convocatoria
            WHERE cm.id = $1
        `, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Materia no encontrada' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error buscando convocatoria_materia por ID:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

// Crear una nueva relación convocatoria-materia
const createConvocatoriaMateria = async (req, res) => {
    const { id_convocatoria, id_materia, total_horas, perfil_profesional } = req.body;
    try {
        const result = await pool.query(`
            INSERT INTO convocatoria_materia (id_convocatoria, id_materia, total_horas, perfil_profesional) 
            VALUES ($1, $2, $3, $4) RETURNING *
        `, [id_convocatoria, id_materia, total_horas, perfil_profesional]);
        
        res.status(201).json(result.rows[0]);  // Enviar el registro recién creado
    } catch (error) {
        console.error('Error creando convocatoria_materia:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

// Actualizar una relación convocatoria-materia
const updateConvocatoriaMateria = async (req, res) => {
    const { id } = req.params;
    const { id_convocatoria, id_materia, total_horas, perfil_profesional } = req.body;
    try {
        const result = await pool.query(`
            UPDATE convocatoria_materia 
            SET id_convocatoria = $1, id_materia = $2, total_horas = $3, perfil_profesional = $4 
            WHERE id = $5 RETURNING *
        `, [id_convocatoria, id_materia, total_horas, perfil_profesional, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Relación convocatoria-materia no encontrada' });
        }
        
        res.json(result.rows[0]);  // Devolver la relación actualizada
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

        res.json(result.rows[0]);  // Devolver la relación eliminada
    } catch (error) {
        console.error('Error eliminando convocatoria_materia:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

module.exports = { getConvocatoriaMaterias, getConvocatoriaMateriaById, createConvocatoriaMateria, updateConvocatoriaMateria, deleteConvocatoriaMateria };
