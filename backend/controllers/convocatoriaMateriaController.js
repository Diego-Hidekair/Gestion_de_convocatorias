// backend/controllers/convocatoriaMateriaController.js
const pool = require('../db');

const getConvocatoriaMaterias = async (req, res) => {
    const { id_convocatoria } = req.params;
    try {
        const result = await pool.query(`
            SELECT cm.id_materias, cm.total_horas, cm.perfil_profesional, 
                cm.tiempo_trabajo, m.nombre AS nombre_materia,
                c.nombre AS nombre_convocatoria
            FROM convocatorias_materias cm
            JOIN planes.pln_materias m ON cm.id_materia = m.id_materia
            JOIN convocatorias c ON cm.id_convocatoria = c.id_convocatoria
            WHERE cm.id_convocatoria = $1
        `, [id_convocatoria]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No se encontraron materias para esta convocatoria' });
        }

        res.json(result.rows);
    } catch (error) {
        console.error('Error buscando convocatorias_materias:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

const getConvocatoriaMateriaById = async (req, res) => {
    const { id_convocatoria, id_materia } = req.params;
    try {
        const result = await pool.query(`
            SELECT cm.id_materias, cm.total_horas, cm.perfil_profesional, 
                cm.tiempo_trabajo, m.nombre AS nombre_materia,
                c.nombre AS nombre_convocatoria
            FROM convocatorias_materias cm
            JOIN planes.pln_materias m ON cm.id_materia = m.id_materia
            JOIN convocatorias c ON cm.id_convocatoria = c.id_convocatoria
            WHERE cm.id_convocatoria = $1 AND cm.id_materia = $2
        `, [id_convocatoria, id_materia]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Relación convocatoria-materia no encontrada' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error buscando convocatorias_materias por ID:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

const createConvocatoriaMateriaMultiple = async (req, res) => {
    const { id_convocatoria, materiasSeleccionadas, perfil_profesional } = req.body;
    console.log("Datos recibidos:", req.body);
    
    if (!materiasSeleccionadas || !Array.isArray(materiasSeleccionadas)) {
        return res.status(400).json({ error: "materiasSeleccionadas debe ser un array." });
    }

    try {
        let idsMaterias = [];
        for (const id_materia of materiasSeleccionadas) {
            const materiaResult = await pool.query(`
                SELECT total_horas 
                FROM planes.pln_materias 
                WHERE id_materia = $1
            `, [id_materia]);

            if (materiaResult.rows.length === 0) {
                return res.status(404).json({ error: 'Materia no encontrada' });
            }

            const total_horas = materiaResult.rows[0].total_horas;
            const tiempoTrabajo = total_horas >= 24 ? 'TIEMPO COMPLETO' : 'TIEMPO HORARIO';

            const result = await pool.query(`
                INSERT INTO convocatorias_materias (id_convocatoria, id_materia, perfil_profesional, total_horas, tiempo_trabajo) 
                VALUES ($1, $2, $3, $4, $5) 
                RETURNING id_materia;
            `, [id_convocatoria, id_materia, perfil_profesional, total_horas, tiempoTrabajo]);

            idsMaterias.push(result.rows[0].id_materia);
        }

        res.status(201).json({ message: 'Materias agregadas con éxito', idsMaterias });
    } catch (error) {
        console.error('Error creando las materias:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

const updateConvocatoriaMateria = async (req, res) => {
    const { id_convocatoria, id_materia } = req.params;
    const { perfil_profesional } = req.body;

    try {
        const result = await pool.query(`
            UPDATE convocatorias_materias
            SET perfil_profesional = $1 
            WHERE id_convocatoria = $2 AND id_materia = $3 RETURNING *
        `, [perfil_profesional, id_convocatoria, id_materia]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Relación convocatoria-materia no encontrada' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error actualizando convocatorias_materias:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

const deleteConvocatoriaMateria = async (req, res) => {
    const { id_materias } = req.params;

    try {
        const result = await pool.query('DELETE FROM convocatorias_materias WHERE id_materias = $1 RETURNING *', [id_materias]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Relación convocatoria-materia no encontrada' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error eliminando convocatorias_materias:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

module.exports = { 
    getConvocatoriaMaterias, 
    getConvocatoriaMateriaById, 
    createConvocatoriaMateriaMultiple, 
    updateConvocatoriaMateria, 
    deleteConvocatoriaMateria 
};