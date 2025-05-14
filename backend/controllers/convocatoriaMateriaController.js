// backend/controllers/convocatoriaMateriaController.js
const pool = require('../db');

const addMaterias = async (req, res) => {
    const { id } = req.params;
    const { materias } = req.body;
    
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const convocatoriaCheck = await client.query(
            'SELECT id_convocatoria FROM convocatorias WHERE id_convocatoria = $1',
            [id]
        );
        
        if (convocatoriaCheck.rows.length === 0) {
            throw new Error('La convocatoria no existe');
        }
        await client.query(
            'DELETE FROM convocatorias_materias WHERE id_convocatoria = $1',
            [id]
        );
        for (const materia of materias) {
            await client.query(`
                INSERT INTO convocatorias_materias 
                (id_convocatoria, id_materia, total_horas)
                VALUES ($1, $2, 
                    CASE 
                        WHEN $3 > 0 THEN $3 
                        ELSE (SELECT m.total_horas FROM datos_universidad.pln_materias m WHERE m.id_materia = $2)
                    END)
                RETURNING *
            `, [id, materia.id_materia, materia.total_horas]);
        }
        await client.query('COMMIT');
        res.status(200).json({ 
            message: 'Materias asignadas correctamente',
            convocatoriaId: id,
            materiasCount: materias.length
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error al asignar materias:', error);
        res.status(500).json({
            error: error.message || 'Error al asignar materias',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    } finally {
        client.release();
    }
};

const getMateriasByConvocatoria = async (req, res) => {// obtener materias de una convocatoria
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

const deleteMateria = async (req, res) => {// eliminar una materia especifica
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

const getMateriasByPrograma = async (req, res) => {
    try {
        const { id_programa } = req.params;
        
        const result = await pool.query(`
            SELECT m.id_materia, m.materia, m.cod_materia, 
                   m.horas_teoria, m.horas_practica, m.horas_laboratorio
            FROM datos_universidad.pln_materias m
            WHERE m.id_programa = $1
            ORDER BY m.materia
        `, [id_programa]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ 
                error: 'No se encontraron materias para este programa',
                details: `Programa ID: ${id_programa}`
            });
        }
        
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener materias por programa:', error);
        res.status(500).json({ error: 'Error al obtener materias por programa' });
    }
};

module.exports = { addMaterias, getMateriasByConvocatoria,deleteMateria, getMateriasByPrograma};
