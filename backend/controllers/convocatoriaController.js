// backend/controllers/convocatoriaController.js
const pool = require('../db');

// Obtener todas las convocatorias
const getConvocatorias = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT  
                c.id_convocatoria, 
                c.nombre, 
                c.fecha_inicio, 
                c.fecha_fin, 
                c.id_usuario, 
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
            ORDER BY c.id_convocatoria
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

const getConvocatoriaById = async (req, res) => {
    const { id } = req.params;
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
            WHERE c.id_convocatoria = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Convocatoria no encontrada' });
        }
        res.json(result.rows[0]);
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

const createConvocatoria = async (req, res) => {
    console.log("Datos recibidos:", req.body);
    try {
        const id_usuario = req.user.id;
        const id_facultad = req.user.id_facultad; 
        const { horario, nombre, fecha_inicio, fecha_fin, id_tipoconvocatoria, id_programa, prioridad, gestion } = req.body;
        
        console.log("Datos del usuario logeado:", req.user);
        if (!nombre || !fecha_inicio || !fecha_fin || !id_tipoconvocatoria || !id_programa || !id_facultad || !prioridad || !gestion) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }

        const result = await pool.query(`
            INSERT INTO convocatorias 
            (horario, nombre, fecha_inicio, fecha_fin, id_tipoconvocatoria, id_programa, id_facultad, id_usuario, prioridad, gestion) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
            RETURNING id_convocatoria, nombre, fecha_inicio, fecha_fin, id_usuario, estado, comentario_observado
        `, [horario, nombre, fecha_inicio, fecha_fin, id_tipoconvocatoria, id_programa, id_facultad, id_usuario, prioridad, gestion]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al crear la convocatoria:', error);
        res.status(500).send('Error al crear la convocatoria');
    }
}; 
    
const updateConvocatoria = async (req, res) => {
    const { id } = req.params;
    const { horario, nombre, fecha_inicio, fecha_fin, id_tipoconvocatoria, id_programa, id_facultad, prioridad, gestion } = req.body;
    try {
        const result = await pool.query(`
            UPDATE convocatorias 
            SET horario = $1, nombre = $2, fecha_inicio = $3, fecha_fin = $4, id_tipoconvocatoria = $5, id_programa = $6, id_facultad = $7, prioridad = $8, gestion = $9
            WHERE id_convocatoria = $10 
            RETURNING id_convocatoria, nombre, fecha_inicio, fecha_fin, estado, comentario_observado
        `, [horario, nombre, fecha_inicio, fecha_fin, id_tipoconvocatoria, id_programa, id_facultad, prioridad, gestion, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Convocatoria no encontrada' });
        }

        res.json(result.rows[0]);
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

    
module.exports = { getConvocatoriasByFacultad, updateEstadoConvocatoria, getConvocatorias, getConvocatoriaById, createConvocatoria, updateConvocatoria, getConvocatoriasByEstado, getConvocatoriasByFacultadAndEstado, updateComentarioObservado  };