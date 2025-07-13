// backend/controllers/convocatoriaMateriaController.js
const pool = require('../db');

const addMaterias = async (req, res) => {
  const { id } = req.params;
  const { materias } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const convocatoriaCheck = await client.query(
      'SELECT tipo_jornada FROM convocatorias WHERE id_convocatoria = $1',
      [id]
    );

    if (convocatoriaCheck.rowCount === 0) {
      throw new Error('La convocatoria no existe');
    }

    const tipoJornada = convocatoriaCheck.rows[0].tipo_jornada;

    // Calcular suma total de horas
    let sumaHoras = 0;
    for (const materia of materias) {
      const horas = materia.total_horas > 0
        ? materia.total_horas
        : (await client.query(
            `SELECT COALESCE(horas_teoria,0) + COALESCE(horas_practica,0) + COALESCE(horas_laboratorio,0) AS total
             FROM datos_universidad.pln_materias
             WHERE id_materia = $1`,
            [materia.id_materia]
          )).rows[0]?.total || 0;
      sumaHoras += horas;
    }

    // Validar según tipo de jornada
    if (tipoJornada === 'TIEMPO HORARIO' && sumaHoras > 16) {
      throw new Error('La suma total de horas no puede superar las 16 horas para convocatorias de TIEMPO HORARIO.');
    }

    if (tipoJornada === 'TIEMPO COMPLETO' && sumaHoras < 20) {
      throw new Error('La suma total de horas debe ser al menos 20 para convocatorias de TIEMPO COMPLETO.');
    }

    // Eliminar materias anteriores
    await client.query('DELETE FROM convocatorias_materias WHERE id_convocatoria = $1', [id]);

    // Insertar nuevas materias
    for (const materia of materias) {
      await client.query(
        `INSERT INTO convocatorias_materias 
          (id_convocatoria, id_materia, total_horas)
         VALUES ($1, $2, 
           CASE 
             WHEN $3 > 0 THEN $3 
             ELSE (SELECT COALESCE(horas_teoria,0)+COALESCE(horas_practica,0)+COALESCE(horas_laboratorio,0)
                   FROM datos_universidad.pln_materias WHERE id_materia = $2)
           END)`,
        [id, materia.id_materia, materia.total_horas]
      );
    }

    await client.query('COMMIT');
    res.status(200).json({
      success: true,
      message: 'Materias asignadas correctamente',
      convocatoriaId: id,
      materiasCount: materias.length
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error al asignar materias:', error);
    res.status(500).json({
      error: error.message || 'Error al asignar materias',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    client.release();
  }
};


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
const updateMateria = async (req, res) => {
    const { id } = req.params;
    const { operaciones } = req.body;
    
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // Verificar que la convocatoria existe
        const convocatoriaCheck = await client.query(
            'SELECT id_convocatoria FROM convocatorias WHERE id_convocatoria = $1',
            [id]
        );
        
        if (convocatoriaCheck.rows.length === 0) {
            throw new Error('La convocatoria no existe');
        }

        const resultados = {
            agregadas: [],
            actualizadas: [],
            eliminadas: []
        };

        // Procesar cada operación
        for (const op of operaciones) {
            switch (op.tipo) {
                case 'agregar':
                    const materiaAgregada = await client.query(`
                        INSERT INTO convocatorias_materias 
                        (id_convocatoria, id_materia, total_horas)
                        VALUES ($1, $2, 
                            CASE 
                                WHEN $3 > 0 THEN $3 
                                ELSE (SELECT m.total_horas FROM datos_universidad.pln_materias m WHERE m.id_materia = $2)
                            END)
                        ON CONFLICT (id_convocatoria, id_materia) 
                        DO UPDATE SET total_horas = EXCLUDED.total_horas
                        RETURNING *
                    `, [id, op.id_materia, op.total_horas]);
                    resultados.agregadas.push(materiaAgregada.rows[0]);
                    break;

                case 'actualizar':
                    const materiaActualizada = await client.query(
                        'UPDATE convocatorias_materias SET total_horas = $1 WHERE id_convocatoria = $2 AND id_materia = $3 RETURNING *',
                        [op.total_horas, id, op.id_materia]
                    );
                    if (materiaActualizada.rows.length > 0) {
                        resultados.actualizadas.push(materiaActualizada.rows[0]);
                    }
                    break;

                case 'eliminar':
                    const materiaEliminada = await client.query(
                        'DELETE FROM convocatorias_materias WHERE id_convocatoria = $1 AND id_materia = $2 RETURNING *',
                        [id, op.id_materia]
                    );
                    if (materiaEliminada.rows.length > 0) {
                        resultados.eliminadas.push(materiaEliminada.rows[0]);
                    }
                    break;

                default:
                    throw new Error(`Tipo de operación no válido: ${op.tipo}`);
            }
        }

        await client.query('COMMIT');
        
        // Obtener el estado final
        const materiasActuales = await client.query(`
            SELECT cm.id_materia, cm.total_horas, 
                   m.materia, m.cod_materia
            FROM convocatorias_materias cm
            JOIN datos_universidad.pln_materias m ON cm.id_materia = m.id_materia
            WHERE cm.id_convocatoria = $1
        `, [id]);

        res.status(200).json({
            success: true,
            message: 'Operaciones completadas correctamente',
            resultados,
            materiasActuales: materiasActuales.rows
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error al gestionar materias:', error);
        res.status(500).json({
            error: error.message || 'Error al gestionar materias',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    } finally {
        client.release();
    }
};

module.exports = { addMaterias, getMateriasByConvocatoria,deleteMateria, getMateriasByPrograma, updateMateria};