// backend/controllers/convocatoriaMateriaController.js
const pool = require('../db');

const addMaterias = async (req, res) => {
    const { id } = req.params; 
    const { materias } = req.body;    
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const convocatoria = await client.query(
            'SELECT id_programa FROM convocatorias WHERE id_convocatoria = $1', 
            [id]
        );
        if (!convocatoria.rows[0]) {
            throw new Error('Convocatoria no encontrada');
        }

        await client.query(
            'DELETE FROM convocatorias_materias WHERE id_convocatoria = $1',
            [id]
        );
        for (const materia of materias) {
            const materiaValida = await client.query(
                `SELECT 1 FROM datos_universidad.pln_materias 
                 WHERE id_materia = $1 AND id_programa = $2`,
                [materia.id_materia, convocatoria.rows[0].id_programa]
            );
            if (!materiaValida.rows[0]) {
                throw new Error(`Materia ${materia.id_materia} no válida para este programa`);
            }
            await client.query(
                `INSERT INTO convocatorias_materias 
                 (id_convocatoria, id_materia, total_horas) 
                 VALUES ($1, $2, $3)`,
                [id, materia.id_materia, materia.total_horas]
            );
        }

        await client.query('COMMIT');
        res.json({ success: true, message: 'Materias actualizadas correctamente' });
    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: error.message });
    } finally {
        client.release();
    }
};

// obtener materias de una convocatoria
const getMateriasByConvocatoria = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
            SELECT cm.id_materia, cm.total_horas, 
                   m.materia, m.cod_materia, m.horas_teoria, m.horas_practica
            FROM convocatorias_materias cm
            JOIN datos_universidad.pln_materias m ON cm.id_materia = m.id_materia
            WHERE cm.id_convocatoria = $1
        `, [id]);
        
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// eliminar una materia especifica
const deleteMateria = async (req, res) => {
    const { id, id_materia } = req.params;
    try {
        const result = await pool.query(
            'DELETE FROM convocatorias_materias WHERE id_convocatoria = $1 AND id_materia = $2 RETURNING *',
            [id, id_materia]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Relación no encontrada' });
        }
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { addMaterias, getMateriasByConvocatoria,deleteMateria};
