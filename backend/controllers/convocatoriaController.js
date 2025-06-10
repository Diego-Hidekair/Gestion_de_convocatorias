// backend/controllers/convocatoriaController.js
const pool = require('../db');
const { check, validationResult } = require('express-validator');

const validateConvocatoria = [
    check('tipo_jornada').isIn(['TIEMPO COMPLETO', 'TIEMPO HORARIO']),
    check('fecha_fin').custom((value, { req }) => {
        if (new Date(value) <= new Date(req.body.fecha_inicio)) {
            throw new Error('La fecha fin debe ser posterior a la fecha inicio');
        }
        return true;
    }),
    check('id_tipoconvocatoria').isInt(),
    check('etapa_convocatoria').isIn(['PRIMERA', 'SEGUNDA', 'TERCERA']),
    check('pago_mensual').optional().isInt({ min: 0 }),
    check('gestion').isIn(['GESTION 1', 'GESTION 2'])
];

const getFullConvocatoria = async (id_convocatoria) => {
    const convocatoria = await pool.query(`
        SELECT c.*, tc.nombre_tipo_conv, p.programa, f.facultad, 
            u.nombres || ' ' || u.apellido_paterno AS creador,
            v.nombre_vicerector
        FROM convocatorias c
        JOIN tipos_convocatorias tc ON c.id_tipoconvocatoria = tc.id_tipoconvocatoria
        JOIN datos_universidad.alm_programas p ON c.id_programa = p.id_programa
        JOIN datos_universidad.alm_programas_facultades f ON p.id_facultad = f.id_facultad
        JOIN usuarios u ON c.id_usuario = u.id_usuario
        JOIN vicerrector v ON c.id_vicerector = v.id_vicerector
        WHERE c.id_convocatoria = $1
    `, [id_convocatoria]);

    if (convocatoria.rows.length === 0) return null;

    const materias = await pool.query(`
        SELECT cm.*, m.materia, m.cod_materia, m.horas_teoria, m.horas_practica, m.horas_laboratorio
        FROM convocatorias_materias cm
        JOIN datos_universidad.pln_materias m ON cm.id_materia = m.id_materia
        WHERE cm.id_convocatoria = $1
    `, [id_convocatoria]);

    const archivos = await pool.query(`
        SELECT * FROM convocatorias_archivos WHERE id_convocatoria = $1
    `, [id_convocatoria]);

    return {
        ...convocatoria.rows[0],
        materias: materias.rows,
        archivos: archivos.rows[0] || null
    };
};

const createConvocatoria = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        const { tipo_jornada, fecha_fin, id_tipoconvocatoria, etapa_convocatoria, 
                pago_mensual = 0, resolucion, dictamen, perfil_profesional, gestion } = req.body;

        if (!req.user?.id_usuario) throw new Error('Usuario no autenticado');
        const id_usuario = req.user.id_usuario;
        const id_programa = req.user.id_programa?.trim();
        if (!id_programa) throw new Error('El usuario no tiene programa asociado');

        const [programaData, tipoConvocatoria, vicerrector] = await Promise.all([
            client.query('SELECT p.programa, f.facultad FROM datos_universidad.alm_programas p JOIN datos_universidad.alm_programas_facultades f ON p.id_facultad = f.id_facultad WHERE p.id_programa = $1', [id_programa]),
            client.query('SELECT id_tipoconvocatoria, nombre_tipo_conv FROM tipos_convocatorias WHERE id_tipoconvocatoria = $1', [id_tipoconvocatoria]),
            client.query('SELECT id_vicerector FROM vicerrector LIMIT 1')
        ]);


        if (!programaData.rows[0] || !tipoConvocatoria.rows[0] || !vicerrector.rows[0]) {
            throw new Error('Datos requeridos no encontrados');
        }

        const programa = programaData.rows[0].programa;
        const tipo = tipoConvocatoria.rows[0].nombre_tipo_conv;
        const year = new Date().getFullYear();
        
        let nombre_conv;
        if (tipo.includes('EXTRAORDINARIO')) {
            nombre_conv = `${etapa_convocatoria} CONVOCATORIA A CONCURSO DE MERITOS PARA LA PROVISION DE DOCENTE EXTRAORDINARIO EN CALIDAD DE INTERINO A ${tipo_jornada} PARA LA CARRERA DE ${programa} SOLO POR LA GESTIÓN ACADÉMICA ${year}`;
        } else if (tipo.includes('ORDINARIO')) {
            nombre_conv = `${etapa_convocatoria} CONVOCATORIA A CONCURSO DE MERITOS Y EXAMENES DE COMPETENCIA PARA LA PROVISIÓN DE DOCENTE ORDINARIO A ${tipo_jornada} PARA LA CARRERA DE ${programa} - GESTION ${year}`;
        } else if (tipo.includes('CONSULTORES')) {
            nombre_conv = `${etapa_convocatoria} CONVOCATORIA A CONCURSO DE MERITOS PARA LA CONTRATACION DE DOCENTES EN CALIDAD DE CONSULTORES DE LÍNEA A ${tipo_jornada} PARA LA CARRERA DE ${programa} POR LA GESTIÓN ACADÉMICA ${year}`;
        } else {
            // Formato por defecto si no coincide con los anteriores
            nombre_conv = `${etapa_convocatoria} CONVOCATORIA ${tipo} - ${programa} - GESTION ${year}`;
        }

        const convResult = await client.query(
            `INSERT INTO convocatorias (
                tipo_jornada, nombre_conv, fecha_inicio, fecha_fin, etapa_convocatoria, 
                estado, gestion, pago_mensual, resolucion, dictamen, perfil_profesional,
                id_vicerector, id_usuario, id_tipoconvocatoria, id_programa
            ) VALUES ($1, $2, CURRENT_DATE, $3, $4, 'Para Revisión', $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING id_convocatoria`,
            [tipo_jornada, nombre_conv, fecha_fin, etapa_convocatoria, gestion, 
            pago_mensual, resolucion, dictamen, perfil_profesional,
            vicerrector.rows[0].id_vicerector, id_usuario, id_tipoconvocatoria, id_programa]
        );

        await client.query('INSERT INTO convocatorias_archivos (id_convocatoria) VALUES ($1)', [convResult.rows[0].id_convocatoria]);
        await client.query('COMMIT');
        
        res.status(201).json({
            id_convocatoria: convResult.rows[0].id_convocatoria,
            message: 'Convocatoria creada exitosamente'
        });
    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: error.message });
    } finally {
        client.release();
    }
};

const getConvocatorias = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT  
                c.id_convocatoria, 
                c.nombre_conv, 
                c.fecha_inicio, 
                c.fecha_fin, 
                c.estado,
                c.comentario_observado,
                tc.nombre_tipo_conv AS nombre_tipoconvocatoria, 
                p.programa AS nombre_programa,  
                f.facultad AS nombre_facultad,
                u.nombres || ' ' || u.apellido_paterno AS nombre_usuario,
                ca.nombre_archivo
            FROM convocatorias c
            LEFT JOIN tipos_convocatorias tc ON c.id_tipoconvocatoria = tc.id_tipoconvocatoria
            LEFT JOIN datos_universidad.alm_programas p ON c.id_programa = p.id_programa
            LEFT JOIN datos_universidad.alm_programas_facultades f ON p.id_facultad = f.id_facultad
            LEFT JOIN usuarios u ON c.id_usuario = u.id_usuario
            LEFT JOIN convocatorias_archivos ca ON ca.id_convocatoria = c.id_convocatoria
            ORDER BY c.id_convocatoria DESC
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getTiposConvocatoria = async (req, res) => {
  try {
    console.log('Consultando tipos de convocatorias...');
    const result = await pool.query(
      'SELECT id_tipoconvocatoria, nombre_tipo_conv FROM tipos_convocatorias'
    );
    console.log('Resultados encontrados:', result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error('Error en getTiposConvocatoria:', err);
    res.status(500).json({ error: err.message });
  }
};

const getConvocatoriaById = async (req, res) => {
    try {
        const convocatoria = await getFullConvocatoria(req.params.id);
        if (!convocatoria) {
            return res.status(404).json({ error: 'Convocatoria no encontrada' });
        }
        res.json(convocatoria);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}; 

const updateConvocatoria = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        const { 
            tipo_jornada, 
            fecha_fin, 
            id_tipoconvocatoria,
            etapa_convocatoria,
            pago_mensual = 0,
            resolucion,
            dictamen,
            perfil_profesional,
            gestion
        } = req.body;

        const [convocatoriaActual, tipoConvocatoria, programaData] = await Promise.all([
            client.query('SELECT id_programa FROM convocatorias WHERE id_convocatoria = $1', [id]),
            client.query('SELECT nombre_tipo_conv FROM tipos_convocatorias WHERE id_tipoconvocatoria = $1', [id_tipoconvocatoria]),
            client.query('SELECT programa FROM datos_universidad.alm_programas WHERE id_programa = (SELECT id_programa FROM convocatorias WHERE id_convocatoria = $1)', [id])
        ]);

        if (!convocatoriaActual.rows[0] || !tipoConvocatoria.rows[0] || !programaData.rows[0]) {
            throw new Error('Datos requeridos no encontrados');
        }

        const programa = programaData.rows[0].programa;
        const tipo = tipoConvocatoria.rows[0].nombre_tipo_conv;
        const year = new Date().getFullYear();
        
        let nombre_conv;
        if (tipo.includes('EXTRAORDINARIO')) {
            nombre_conv = `${etapa_convocatoria} CONVOCATORIA A CONCURSO DE MERITOS PARA LA PROVISION DE DOCENTE EXTRAORDINARIO EN CALIDAD DE INTERINO A ${tipo_jornada} PARA LA CARRERA DE ${programa} SOLO POR LA GESTIÓN ACADÉMICA ${year}`;
        } else if (tipo.includes('ORDINARIO')) {
            nombre_conv = `${etapa_convocatoria} CONVOCATORIA A CONCURSO DE MERITOS Y EXAMENES DE COMPETENCIA PARA LA PROVISIÓN DE DOCENTE ORDINARIO A ${tipo_jornada} PARA LA CARRERA DE ${programa} - GESTION ${year}`;
        } else if (tipo.includes('CONSULTORES')) {
            nombre_conv = `${etapa_convocatoria} CONVOCATORIA A CONCURSO DE MERITOS PARA LA CONTRATACION DE DOCENTES EN CALIDAD DE CONSULTORES DE LÍNEA A ${tipo_jornada} PARA LA CARRERA DE ${programa} POR LA GESTIÓN ACADÉMICA ${year}`;
        } else {
            nombre_conv = `${etapa_convocatoria} CONVOCATORIA ${tipo} - ${programa} - GESTION ${year}`;
        }

        const convResult = await client.query(
            `UPDATE convocatorias SET
                tipo_jornada = $1, 
                fecha_fin = $2,
                etapa_convocatoria = $3, 
                pago_mensual = $4,
                resolucion = $5, 
                dictamen = $6, 
                perfil_profesional = $7,
                gestion = $8,
                id_tipoconvocatoria = $9,
                nombre_conv = $10
            WHERE id_convocatoria = $11
            RETURNING *`,
            [
                tipo_jornada, 
                fecha_fin,
                etapa_convocatoria, 
                pago_mensual, 
                resolucion, 
                dictamen,
                perfil_profesional, 
                gestion, 
                id_tipoconvocatoria,
                nombre_conv,
                id
            ]
        );

        if (convResult.rows.length === 0) {
            throw new Error('Convocatoria no encontrada');
        }

        await client.query('COMMIT');
        
        const convocatoriaActualizada = await getFullConvocatoria(id);
        res.json(convocatoriaActualizada);

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error al actualizar convocatoria:', error);
        res.status(500).json({ 
            error: 'Error al actualizar convocatoria',
            details: error.message 
        });
    } finally {
        client.release();
    }
};

const getConvocatoriasByFacultad = async (req, res) => {
    const { id_programa } = req.user;

    if (!id_programa) {
        return res.status(400).json({ error: 'El usuario no tiene programa asociado' });
    }

    try {
        const facultadResult = await pool.query(
            `SELECT f.id_facultad 
            FROM datos_universidad.alm_programas p
            JOIN datos_universidad.alm_programas_facultades f ON p.id_facultad = f.id_facultad
            WHERE p.id_programa = $1`,
            [id_programa]
        );

        if (facultadResult.rows.length === 0) {
            return res.status(404).json({ error: 'No se encontró la facultad del usuario' });
        }

        const id_facultad = facultadResult.rows[0].id_facultad;

        const result = await pool.query(`
            SELECT 
                c.id_convocatoria, 
                c.nombre_conv, 
                c.fecha_inicio, 
                c.fecha_fin, 
                c.estado,
                c.comentario_observado,
                tc.nombre_tipo_conv AS nombre_tipoconvocatoria, 
                p.programa AS nombre_programa,
                f.facultad AS nombre_facultad,
                u.nombres || ' ' || u.apellido_paterno AS nombre_usuario,
                ca.nombre_archivo
            FROM convocatorias c
            LEFT JOIN tipos_convocatorias tc ON c.id_tipoconvocatoria = tc.id_tipoconvocatoria
            LEFT JOIN datos_universidad.alm_programas p ON c.id_programa = p.id_programa
            LEFT JOIN datos_universidad.alm_programas_facultades f ON p.id_facultad = f.id_facultad
            LEFT JOIN usuarios u ON c.id_usuario = u.id_usuario
            LEFT JOIN convocatorias_archivos ca ON ca.id_convocatoria = c.id_convocatoria
            WHERE f.id_facultad = $1
            ORDER BY c.fecha_inicio DESC
        `, [id_facultad]);

        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getConvocatoriasByEstado = async (req, res) => {
    const { estado } = req.params;
    try {
        const result = await pool.query(
            `SELECT * FROM convocatorias WHERE estado = $1 ORDER BY fecha_inicio DESC`, 
            [estado]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getConvocatoriasByFacultadAndEstado = async (req, res) => {
    const { estado } = req.params;
    const { id_programa } = req.user;

    if (!id_programa) {
        return res.status(400).json({ error: 'El usuario no tiene programa asociado' });
    }

    try {
        const facultadResult = await pool.query(
            `SELECT f.id_facultad 
            FROM datos_universidad.alm_programas p
            JOIN datos_universidad.alm_programas_facultades f ON p.id_facultad = f.id_facultad
            WHERE p.id_programa = $1`,
            [id_programa]
        );

        if (facultadResult.rows.length === 0) {
            return res.status(404).json({ error: 'No se encontró la facultad del usuario' });
        }

        const id_facultad = facultadResult.rows[0].id_facultad;

        const result = await pool.query(`
            SELECT 
                c.id_convocatoria, 
                c.nombre_conv, 
                c.fecha_inicio, 
                c.fecha_fin, 
                c.estado,
                c.comentario_observado,
                tc.nombre_tipo_conv AS nombre_tipoconvocatoria, 
                p.programa AS nombre_programa,
                f.facultad AS nombre_facultad,
                u.nombres || ' ' || u.apellido_paterno AS nombre_usuario,
                ca.nombre_archivo
            FROM convocatorias c
            LEFT JOIN tipos_convocatorias tc ON c.id_tipoconvocatoria = tc.id_tipoconvocatoria
            LEFT JOIN datos_universidad.alm_programas p ON c.id_programa = p.id_programa
            LEFT JOIN datos_universidad.alm_programas_facultades f ON p.id_facultad = f.id_facultad
            LEFT JOIN usuarios u ON c.id_usuario = u.id_usuario
            LEFT JOIN convocatorias_archivos ca ON ca.id_convocatoria = c.id_convocatoria
            WHERE f.id_facultad = $1 AND c.estado = $2
            ORDER BY c.fecha_inicio DESC
        `, [id_facultad, estado]);

        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateEstadoConvocatoria = async (req, res) => {
    const { rol } = req.user;
    const { id } = req.params;
    const { estado, comentario_observado } = req.body;

    try {
        const convocatoriaExistente = await pool.query(
            'SELECT estado FROM convocatorias WHERE id_convocatoria = $1', 
            [id]
        );

        if (convocatoriaExistente.rows.length === 0) {
            return res.status(404).json({ error: 'Convocatoria no encontrada' });
        }

        const estadoActual = convocatoriaExistente.rows[0].estado;
        if (rol === 'tecnico_vicerrectorado') {
            const estadosPermitidosTecnico = ['Para Revisión', 'En Revisión', 'Observado', 'Revisado'];
            if (!estadosPermitidosTecnico.includes(estado)) {
                return res.status(400).json({ error: 'Estado no válido para este rol' });
            }
        } else if (rol === 'vicerrectorado') {
            if (!['Aprobado', 'Devuelto', 'Para Publicar'].includes(estado)) {
                return res.status(400).json({ error: 'Estado no válido para este rol' });
            }
            
            if (estadoActual !== 'Revisado') {
                return res.status(400).json({ 
                    error: 'Solo se pueden aprobar/rechazar convocatorias en estado "Revisado"' 
                });
            }
        } else if (rol !== 'admin') {
            return res.status(403).json({ error: 'No tienes permisos para esta acción' });
        }
        if ((estado === "Observado" || estado === "Devuelto") && !comentario_observado) {
            return res.status(400).json({ 
                error: 'Se requiere un comentario cuando el estado es "Observado" o "Devuelto"' 
            });
        }
        let query;
        let values;

        if (estado === "Observado" || estado === "Devuelto") {
            query = `
                UPDATE convocatorias 
                SET estado = $1, comentario_observado = $2 
                WHERE id_convocatoria = $3 
                RETURNING *`;
            values = [estado, comentario_observado, id];
        } else {
            query = `
                UPDATE convocatorias 
                SET estado = $1, comentario_observado = NULL 
                WHERE id_convocatoria = $2 
                RETURNING *`;
            values = [estado, id];
        }

        const result = await pool.query(query, values);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateComentarioObservado = async (req, res) => {
    const { id } = req.params;
    const { comentario_observado } = req.body;
    const { rol } = req.user;
    if (rol !== 'tecnico_vicerrectorado' && rol !== 'vicerrectorado' && rol !== 'admin') {
        return res.status(403).json({ error: 'No tienes permisos para editar comentarios' });
    }

    try {
        const convocatoria = await pool.query(
            'SELECT estado FROM convocatorias WHERE id_convocatoria = $1', 
            [id]
        );
        if (convocatoria.rows.length === 0) {
            return res.status(404).json({ error: 'Convocatoria no encontrada' });
        }
        if (!['Observado', 'Devuelto'].includes(convocatoria.rows[0].estado)) {
            return res.status(400).json({ 
                error: 'Solo se puede editar comentario en convocatorias con estado "Observado" o "Devuelto"' 
            });
        }
        const result = await pool.query(`
            UPDATE convocatorias  
            SET comentario_observado = $1
            WHERE id_convocatoria = $2 
            RETURNING id_convocatoria, estado, comentario_observado
        `, [comentario_observado, id]);

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { validateConvocatoria, createConvocatoria, getConvocatorias, getConvocatoriaById, updateConvocatoria, updateEstadoConvocatoria, updateComentarioObservado, getFullConvocatoria, getConvocatoriasByFacultad, getConvocatoriasByEstado, getConvocatoriasByFacultadAndEstado, getTiposConvocatoria};
