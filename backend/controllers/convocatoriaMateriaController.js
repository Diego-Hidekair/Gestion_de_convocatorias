// backend/controllers/convocatoriaMateriaController.js
const pool = require('../db');

const addMaterias = async (req, res) => {
  const { id } = req.params;
  const { items } = req.body; 

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Verificar convocatoria
    const convocatoriaCheck = await client.query(`
      SELECT tipo_jornada, tc.nombre_tipo_conv
      FROM convocatorias c
      JOIN tipos_convocatorias tc ON c.id_tipoconvocatoria = tc.id_tipoconvocatoria
      WHERE c.id_convocatoria = $1
    `, [id]);

    if (convocatoriaCheck.rowCount === 0) {
      throw new Error('La convocatoria no existe');
    }

    const { tipo_jornada: tipoJornada, nombre_tipo_conv: tipoConvocatoria } = convocatoriaCheck.rows[0];
    
    // Validación docente ordinario - ahora contamos todas las materias en todos los ítems
    const totalMaterias = items.reduce((total, item) => total + item.materias.length, 0);
    if (
      tipoConvocatoria.trim().toUpperCase() === 'DOCENTE EN CALIDAD ORDINARIO' &&
      totalMaterias > 1
    ) {
      throw new Error('Para convocatorias de Docente Ordinario solo se permite asignar una materia');
    }

    // Validación de horas por item
    for (const item of items) {
      const horasPorItem = {};
      
      for (const materia of item.materias) {
        const result = await client.query(
          `SELECT COALESCE(horas_teoria,0) + COALESCE(horas_practica,0) + COALESCE(horas_laboratorio,0) AS total
           FROM datos_universidad.pln_materias
           WHERE id_materia = $1`,
          [materia.id_materia]
        );
        const horas = result.rows[0]?.total || 0;

        if (!horasPorItem[item.item]) horasPorItem[item.item] = 0;
        horasPorItem[item.item] += horas;
      }

      // Validar límites de horas por ítem
      for (const [itemKey, sumaHoras] of Object.entries(horasPorItem)) {
        if (tipoJornada === 'TIEMPO HORARIO' && sumaHoras > 16) {
          throw new Error(`El item ${itemKey} supera las 16 horas permitidas para TIEMPO HORARIO.`);
        }
        if (tipoJornada === 'TIEMPO COMPLETO' && sumaHoras < 20) {
          throw new Error(`El item ${itemKey} debe tener al menos 20 horas para TIEMPO COMPLETO.`);
        }
      }
    }

    // Eliminar materias anteriores
    await client.query('DELETE FROM convocatorias_materias WHERE id_convocatoria = $1', [id]);

    // Insertar nuevas materias organizadas por ítem
    for (const item of items) {
      for (const materia of item.materias) {
        const result = await client.query(
          `SELECT COALESCE(horas_teoria,0) + COALESCE(horas_practica,0) + COALESCE(horas_laboratorio,0) AS total
           FROM datos_universidad.pln_materias
           WHERE id_materia = $1`,
          [materia.id_materia]
        );
        const total_horas = result.rows[0]?.total || 0;

        await client.query(
          `INSERT INTO convocatorias_materias (id_convocatoria, id_materia, total_horas, item)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (id_convocatoria, id_materia, item) 
           DO UPDATE SET total_horas = EXCLUDED.total_horas`,
          [id, materia.id_materia, total_horas, item.item]
        );
      }
    }

    await client.query('COMMIT');
    res.status(200).json({
      success: true,
      message: 'Materias asignadas correctamente',
      convocatoriaId: id,
      itemsCount: items.length,
      materiasCount: totalMaterias
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
      SELECT cm.id_materia, cm.total_horas, cm.item,
             m.materia, m.cod_materia, m.horas_teoria, m.horas_practica, m.horas_laboratorio
      FROM convocatorias_materias cm
      JOIN datos_universidad.pln_materias m ON cm.id_materia = m.id_materia
      WHERE cm.id_convocatoria = $1
      ORDER BY cm.item, m.materia
    `, [id]);
    
    // Agrupar por ítem para frontend
    const materiasPorItem = {};
    result.rows.forEach(row => {
      if (!materiasPorItem[row.item]) {
        materiasPorItem[row.item] = [];
      }
      materiasPorItem[row.item].push(row);
    });
    
    res.json(materiasPorItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteMateria = async (req, res) => {
  const { id, id_materia, item } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM convocatorias_materias WHERE id_convocatoria = $1 AND id_materia = $2 AND item = $3 RETURNING *',
      [id, id_materia, item]
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
            (id_convocatoria, id_materia, total_horas, item)
            VALUES (
              $1, 
              $2, 
              (SELECT COALESCE(horas_teoria,0)+COALESCE(horas_practica,0)+COALESCE(horas_laboratorio,0)
               FROM datos_universidad.pln_materias WHERE id_materia = $2),
              $3
            )
            ON CONFLICT (id_convocatoria, id_materia, item)
            DO UPDATE SET total_horas = EXCLUDED.total_horas
            RETURNING *`,
            [id, op.id_materia, op.item || 1]
          );
          resultados.agregadas.push(materiaAgregada.rows[0]);
          break;

        case 'actualizar':
          const materiaActualizada = await client.query(
            `UPDATE convocatorias_materias 
             SET total_horas = $1 
             WHERE id_convocatoria = $2 AND id_materia = $3 AND item = $4 
             RETURNING *`,
            [op.total_horas, id, op.id_materia, op.item || 1]
          );
          if (materiaActualizada.rows.length > 0) {
            resultados.actualizadas.push(materiaActualizada.rows[0]);
          }
          break;

        case 'eliminar':
          const materiaEliminada = await client.query(
            'DELETE FROM convocatorias_materias WHERE id_convocatoria = $1 AND id_materia = $2 AND item = $3 RETURNING *',
            [id, op.id_materia, op.item || 1]
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
      SELECT cm.id_materia, cm.total_horas, cm.item,
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

module.exports = { addMaterias, getMateriasByConvocatoria, deleteMateria, getMateriasByPrograma, updateMateria };