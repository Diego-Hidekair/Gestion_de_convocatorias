// backend/controllers/convocatoriaMateriaController.js
const pool = require('../db');

// Obtener todas las materias asociadas a una convocatoria
const getConvocatoriaMaterias = async (req, res) => {
    const { id_convocatoria } = req.params;
    try {
        const result = await pool.query(`
            SELECT cm.id, cm.total_horas, cm.perfil_profesional, 
                cm.tiempo_trabajo, 
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
                cm.tiempo_trabajo,
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

const createConvocatoriaMateriaMultiple = async (req, res) => {
    const { id_convocatoria, materiasSeleccionadas, perfil_profesional } = req.body;
    try {
        let totalHorasConvocatoria = 0;
        let idsMaterias = [];
        
        // Calcular el total de horas y realizar las inserciones
        for (const id_materia of materiasSeleccionadas) {
            const materiaResult = await pool.query(`
                SELECT total_horas 
                FROM materia 
                WHERE id_materia = $1
            `, [id_materia]);

            if (materiaResult.rows.length === 0) {
                return res.status(404).json({ error: 'Materia no encontrada' });
            }

            totalHorasConvocatoria += materiaResult.rows[0].total_horas;

            const tiempoTrabajo = totalHorasConvocatoria >= 24 ? 'TIEMPO COMPLETO' : 'TIEMPO HORARIO';

            const result = await pool.query(`
                INSERT INTO convocatoria_materia (id_convocatoria, id_materia, perfil_profesional, total_horas, tiempo_trabajo) 
                VALUES ($1, $2, $3, $4, $5) 
                RETURNING id, id_materia;
            `, [id_convocatoria, id_materia, perfil_profesional, materiaResult.rows[0].total_horas, tiempoTrabajo]);

            idsMaterias.push(result.rows[0].id_materia);
        }

        res.status(201).json({ mensaje: 'Materias agregadas con éxito', totalHorasConvocatoria, idsMaterias });
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

module.exports = { getConvocatoriaMaterias, getConvocatoriaMateriaById, createConvocatoriaMateriaMultiple, updateConvocatoriaMateria, deleteConvocatoriaMateria };
