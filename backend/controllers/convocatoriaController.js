// backend/controllers/convocatoriaController.js
const pool = require('../db');

// Obtener todas las convocatorias con información relacionada
const getConvocatorias = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT  
                c.id_convocatoria, 
                c.nombre_conv AS nombre, 
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

// Obtener convocatorias por facultad y estado
const getConvocatoriasByFacultadAndEstado = async (req, res) => {
    const { estado } = req.params;
    const { id_facultad } = req.user;

    if (!id_facultad) {
        return res.status(400).json({ error: 'El usuario logeado no tiene un id_facultad asociado.' });
    }

    try {
        const result = await pool.query(`
            SELECT 
                c.id_convocatoria, 
                c.nombre, 
                c.fecha_inicio, 
                c.fecha_fin, 
                c.estado,
                c.comentario_observado,
                tc.nombre_convocatoria AS nombre_tipoconvocatoria, 
                p.nombre_carrera AS nombre_programa,  
                f.nombre_facultad AS nombre_facultad,  
                u.nombres AS nombre_usuario,  
                d.documento_path  
            FROM convocatorias c
            LEFT JOIN tipos_convocatorias tc ON c.id_tipoconvocatoria = tc.id_tipoconvocatoria
            LEFT JOIN public.alm_programas p ON c.id_programa = p.id_programa
            LEFT JOIN public.alm_programas_facultades f ON c.id_facultad = f.id_facultad  
            LEFT JOIN usuarios u ON c.id_usuario = u.id_usuario
            LEFT JOIN documentos d ON d.id_convocatoria = c.id_convocatoria
            WHERE f.id_facultad = $1 AND c.estado = $2
        `, [id_facultad, estado]);

        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Crear convocatoria con transacción completa
const createConvocatoria = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // 1. Insertar convocatoria principal
        const { 
            tipo_jornada, 
            nombre_conv, 
            fecha_inicio, 
            fecha_fin, 
            id_tipoconvocatoria, 
            etapa_convocatoria,
            pago_mensual,
            resolucion,
            dictamen,
            perfil_profesional,
            gestion,
            materias,  // Array de materias
            archivos   // Objeto con archivos
        } = req.body;

        const id_usuario = req.user.id;
        const id_programa = req.user.id_programa;

        // Validación básica
        if (!nombre_conv || !fecha_inicio || !fecha_fin || !id_tipoconvocatoria) {
            throw new Error('Faltan campos obligatorios');
        }

        // Obtener vicerrector (asumimos que hay al menos uno)
        const vicerrector = await client.query(
            'SELECT id_vicerector FROM vicerrector LIMIT 1'
        );
        if (!vicerrector.rows[0]) {
            throw new Error('No se ha configurado un vicerrector');
        }

        const convResult = await client.query(`
            INSERT INTO convocatorias (
                tipo_jornada, nombre_conv, fecha_inicio, fecha_fin,
                etapa_convocatoria, estado, gestion, pago_mensual,
                resolucion, dictamen, perfil_profesional,
                id_vicerector, id_usuario, id_tipoconvocatoria, id_programa
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            RETURNING id_convocatoria
        `, [
            tipo_jornada, nombre_conv, fecha_inicio, fecha_fin,
            etapa_convocatoria, 'Para Revisión', gestion, pago_mensual,
            resolucion, dictamen, perfil_profesional,
            vicerrector.rows[0].id_vicerector, id_usuario, id_tipoconvocatoria, id_programa
        ]);

        const id_convocatoria = convResult.rows[0].id_convocatoria;

        // 2. Insertar materias si existen
        if (materias && materias.length > 0) {
            for (const materia of materias) {
                await client.query(`
                    INSERT INTO convocatorias_materias (
                        id_convocatoria, id_materia, total_horas,
                        tiempo_trabajo, perfil_profesional
                    ) VALUES ($1, $2, $3, $4, $5)
                `, [
                    id_convocatoria, materia.id_materia, materia.total_horas,
                    materia.tiempo_trabajo, materia.perfil_profesional
                ]);
            }
        }

        // 3. Insertar archivos si existen
        if (archivos) {
            await client.query(`
                INSERT INTO convocatorias_archivos (
                    id_convocatoria, nombre_archivo, doc_conv,
                    resolucion, dictamen, carta, nota,
                    certificado_item, certificado_presupuestario
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `, [
                id_convocatoria, archivos.nombre_archivo, archivos.doc_conv,
                archivos.resolucion, archivos.dictamen, archivos.carta,
                archivos.nota, archivos.certificado_item, archivos.certificado_presupuestario
            ]);
        }

        await client.query('COMMIT');
        
        // Obtener y devolver la convocatoria completa
        const convocatoriaCompleta = await getConvocatoriaById(id_convocatoria);
        res.status(201).json(convocatoriaCompleta);

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error en transacción:', error);
        res.status(500).json({ 
            error: 'Error al crear convocatoria',
            detalle: error.message 
        });
    } finally {
        client.release();
    }
};

// Obtener convocatoria por ID con toda su información
const getConvocatoriaById = async (req, res) => {
    const { id } = req.params;
    try {
        // Obtener información básica
        const convocatoria = await pool.query(`
            SELECT 
                c.*,
                tc.nombre_tipo_conv AS nombre_tipoconvocatoria,
                p.programa AS nombre_programa,
                f.facultad AS nombre_facultad,
                u.nombres || ' ' || u.apellido_paterno AS nombre_usuario,
                v.nombre_vicerector
            FROM convocatorias c
            LEFT JOIN tipos_convocatorias tc ON c.id_tipoconvocatoria = tc.id_tipoconvocatoria
            LEFT JOIN datos_universidad.alm_programas p ON c.id_programa = p.id_programa
            LEFT JOIN datos_universidad.alm_programas_facultades f ON p.id_facultad = f.id_facultad
            LEFT JOIN usuarios u ON c.id_usuario = u.id_usuario
            LEFT JOIN vicerrector v ON c.id_vicerector = v.id_vicerector
            WHERE c.id_convocatoria = $1
        `, [id]);

        if (convocatoria.rows.length === 0) {
            return res.status(404).json({ error: 'Convocatoria no encontrada' });
        }

        // Obtener materias
        const materias = await pool.query(`
            SELECT 
                cm.*,
                m.materia AS nombre_materia,
                m.cod_materia
            FROM convocatorias_materias cm
            JOIN datos_universidad.pln_materias m ON cm.id_materia = m.id_materia
            WHERE cm.id_convocatoria = $1
        `, [id]);

        // Obtener archivos
        const archivos = await pool.query(`
            SELECT * FROM convocatorias_archivos
            WHERE id_convocatoria = $1
        `, [id]);

        res.json({
            ...convocatoria.rows[0],
            materias: materias.rows,
            archivos: archivos.rows[0] || null
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getConvocatoriasByFacultad = async (req, res) => {
    const { id_facultad } = req.user;
    if (!id_facultad) {
        return res.status(400).json({ error: 'El usuario logeado no tiene un id_facultad asociado.' });
    }

    try {
        const result = await pool.query(`
            SELECT 
                c.id_convocatoria, 
                c.nombre, 
                c.fecha_inicio, 
                c.fecha_fin, 
                c.estado,
                c.comentario_observado,
                tc.nombre_convocatoria AS nombre_tipoconvocatoria, 
                p.nombre_carrera AS nombre_programa,  
                f.nombre_facultad AS nombre_facultad,  
                u.nombres AS nombre_usuario,  
                d.documento_path  
            FROM convocatorias c
            LEFT JOIN tipos_convocatorias tc ON c.id_tipoconvocatoria = tc.id_tipoconvocatoria
            LEFT JOIN public.alm_programas p ON c.id_programa = p.id_programa
            LEFT JOIN public.alm_programas_facultades f ON c.id_facultad = f.id_facultad  
            LEFT JOIN usuarios u ON c.id_usuario = u.id_usuario
            LEFT JOIN documentos d ON d.id_convocatoria = c.id_convocatoria
            WHERE f.id_facultad = $1
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
            `SELECT *, comentario_observado FROM convocatorias WHERE estado = $1`, 
            [estado]
        );
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
        // Verificar que la convocatoria existe
        const convocatoriaExistente = await pool.query(
            'SELECT estado FROM convocatorias WHERE id_convocatoria = $1', 
            [id]
        );

        if (convocatoriaExistente.rows.length === 0) {
            return res.status(404).json({ error: 'Convocatoria no encontrada' });
        }

        const estadoActual = convocatoriaExistente.rows[0].estado;

        // Validaciones según el rol del usuario
        if (rol === 'tecnico_vicerrectorado') {
            // Técnico de Vicerrectorado solo puede cambiar a estados específicos
            const estadosPermitidosTecnico = ['Para Revisión', 'En Revisión', 'Observado', 'Revisado'];
            if (!estadosPermitidosTecnico.includes(estado)) {
                return res.status(400).json({ error: 'Estado no válido para este rol' });
            }
        } else if (rol === 'vicerrectorado') {
            // Vicerrectorado solo puede aprobar o rechazar convocatorias revisadas
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

        // Validaciones específicas para estados que requieren comentario
        if ((estado === "Observado" || estado === "Devuelto") && !comentario_observado) {
            return res.status(400).json({ 
                error: 'Se requiere un comentario cuando el estado es "Observado" o "Devuelto"' 
            });
        }

        // Construir la consulta según el estado
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

    // Verificar permisos
    if (rol !== 'tecnico_vicerrectorado' && rol !== 'vicerrectorado' && rol !== 'admin') {
        return res.status(403).json({ error: 'No tienes permisos para editar comentarios' });
    }

    try {
        // Primero verificar que la convocatoria existe y está en estado que permite comentarios
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

        // Actualizar el comentario
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

    
module.exports = { getConvocatoriasByFacultad, updateEstadoConvocatoria, getConvocatorias, getConvocatoriaById, createConvocatoria, getConvocatoriasByEstado, getConvocatoriasByFacultadAndEstado, updateComentarioObservado  };
