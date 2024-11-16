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
    const { estado } = req.params; // Estado de la convocatoria (p.ej., 'Publicado', 'Observado')
    const { id_facultad } = req.user; // Facultad del usuario autenticado

    if (!id_facultad) {
        return res.status(400).json({ error: "El id de la facultad es requerido" });
    }

    try {
        const result = await pool.query(`
            SELECT 
                c.id_convocatoria, 
                c.nombre, 
                c.fecha_inicio, 
                c.fecha_fin, 
                c.estado,
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

// Mostrar convocatorias por facultad (solo para "secretaria")
const getConvocatoriasByFacultad = async (req, res) => {
    const { id_facultad } = req.user;
    if (!id_facultad) {
        return res.status(400).json({ error: "El id de la facultad es requerido" });
    }

    try {
        const result = await pool.query(`
            SELECT 
                c.id_convocatoria, 
                c.nombre, 
                c.fecha_inicio, 
                c.fecha_fin, 
                c.estado,
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

// Obtener convocatoria por su id
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

// Obtener convocatorias por estado
const getConvocatoriasByEstado = async (req, res) => {
    const { estado } = req.params;
    try {
        const result = await pool.query(
            `SELECT * FROM convocatorias WHERE estado = $1`, [estado]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// nueva convocatoria
const createConvocatoria = async (req, res) => {
    console.log("Datos recibidos:", req.body);
    try {
        const id_usuario = req.user.id; 
        const { horario, nombre, fecha_inicio, fecha_fin, id_tipoconvocatoria, id_programa, id_facultad, prioridad, gestion } = req.body;
        
        const result = await pool.query(`
            INSERT INTO convocatorias 
            (horario, nombre, fecha_inicio, fecha_fin, id_tipoconvocatoria, id_programa, id_facultad, id_usuario, prioridad, gestion) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
            RETURNING *`,
            [horario, nombre, fecha_inicio, fecha_fin, id_tipoconvocatoria, id_programa, id_facultad, id_usuario, prioridad, gestion]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al crear la convocatoria:', error);
        res.status(500).send('Error al crear la convocatoria');
    }
};

// actualizar
const updateConvocatoria = async (req, res) => {
    const { id } = req.params;
    const { horario, nombre, fecha_inicio, fecha_fin, id_tipoconvocatoria, id_programa, id_facultad, prioridad, gestion } = req.body;
    try {
        const result = await pool.query(`
            UPDATE convocatorias 
            SET horario = $1, nombre = $2, fecha_inicio = $3, fecha_fin = $4, id_tipoconvocatoria = $5, id_programa = $6, id_facultad = $7, prioridad = $8, gestion = $9
            WHERE id_convocatoria = $10 
            RETURNING *`,
            [horario, nombre, fecha_inicio, fecha_fin, id_tipoconvocatoria, id_programa, id_facultad, prioridad, gestion, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Convocatoria no encontrada' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateEstadoConvocatoria = async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    const { rol} = req.user;

    console.log('Rol del usuario:', rol);  

    if (rol !== 'admin' && rol !== 'vicerrectorado') {
        return res.status(403).json({ error: 'No tienes permisos para actualizar el estado de la convocatoria' });
    }

    try {
        const result = await pool.query(`
            UPDATE convocatorias 
            SET estado = $1 
            WHERE id_convocatoria = $2 
            RETURNING *`,
            [estado, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Convocatoria no encontrada' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Eliminar 
const deleteConvocatoria = async (req, res) => {
    const { id_convocatoria } = req.params;
    try {
        // Eliminar los documentos relacionados con la convocatoria
        await pool.query('DELETE FROM documentos WHERE id_convocatoria = $1', [id_convocatoria]);

        // Eliminar los registros en convocatorias_materias y honorarios
        await pool.query('DELETE FROM convocatorias_materias WHERE id_convocatoria = $1', [id_convocatoria]);
        await pool.query('DELETE FROM honorarios WHERE id_convocatoria = $1', [id_convocatoria]);

        // Eliminar la convocatoria
        const result = await pool.query('DELETE FROM convocatorias WHERE id_convocatoria = $1 RETURNING *', [id_convocatoria]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Convocatoria no encontrada' });
        }

        res.json({ message: 'Convocatoria eliminada exitosamente' });
    } catch (error) {
        console.error('Error al eliminar la convocatoria:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

module.exports = {  getConvocatoriasByFacultad, updateEstadoConvocatoria, getConvocatorias, getConvocatoriaById, createConvocatoria, updateConvocatoria, deleteConvocatoria, getConvocatoriasByEstado };
