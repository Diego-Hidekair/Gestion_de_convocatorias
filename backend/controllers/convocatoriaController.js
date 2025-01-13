// backend/controllers/convocatoriaController.js
const pool = require('../db');

const getConvocatorias = async (req, res) => {// lista de todas las convocatorias
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

const getConvocatoriasByFacultadAndEstado = async (req, res) => {// categorizar convocatorias por facultad y estado
    const { estado } = req.params;  
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
            WHERE f.id_facultad = $1 AND c.estado = $2
        `, [id_facultad, estado]);

        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getConvocatoriasByFacultad = async (req, res) => {// Mostrar convocatorias por facultad (solo usuario con rol el "secretaria")
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

const getConvocatoriaById = async (req, res) => {// Obtener convocatoria por la id
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

const getConvocatoriasByEstado = async (req, res) => {// categorizar las convocatorias por estado
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


const createConvocatoria = async (req, res) => {
    const { nombre, fecha_inicio, fecha_fin, id_programa, estado, id_tipoconvocatoria } = req.body; //crear una convocatoria nueva
    const id_usuario = req.user.id_usuario;
    const id_facultad = req.user.id_facultad;
    //console.log("Datos recibidos:", req.body);
    console.log("Usuario autenticado:", req.user); 
    if (!id_facultad) {
        return res.status(400).json({ error: "El usuario no pertenece a una facultad asociada" });
    }

    const carreraValida = await pool.query(`
        SELECT 1
        FROM alm_programas
        WHERE id_programa = $1 AND id_facultad = $2
    `, [id_programa, id_facultad]);

    if (carreraValida.rows.length === 0) {
        return res.status(400).json({ error: "La carrera seleccionada no pertenece a la facultad del usuario" });
    }
        try {
            const result = await pool.query(`
                INSERT INTO convocatorias (nombre, fecha_inicio, fecha_fin, id_usuario, id_facultad, id_programa, estado, id_tipoconvocatoria)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`, [
                nombre, fecha_inicio, fecha_fin, id_usuario, id_facultad, id_programa, estado, id_tipoconvocatoria
            ]);

            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error('Error al crear la convocatoria:', error);
            res.status(500).json({ error: 'Error en el servidor al crear la convocatoria' });
        }
    /*try {
        const id_usuario = req.user?.id_usuario; 
        const id_facultad = req.user?.id_facultad; 

        if (!id_usuario || !id_facultad) {
            return res.status(400).json({ error: "El ID de usuario o facultad no está disponible en el token" });
        }
    //        const { horario, nombre, fecha_inicio, fecha_fin, id_tipoconvocatoria, id_programa, id_facultad, prioridad, gestion } = req.body;
        const { horario, nombre, fecha_inicio, fecha_fin, id_tipoconvocatoria, id_programa, prioridad, gestion } = req.body;

        const result = await pool.query(
            `INSERT INTO convocatorias 
            (horario, nombre, fecha_inicio, fecha_fin, id_tipoconvocatoria, id_programa, id_facultad, id_usuario, prioridad, gestion) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
            RETURNING *`,
            [horario, nombre, fecha_inicio, fecha_fin, id_tipoconvocatoria, id_programa, id_facultad, id_usuario, prioridad, gestion]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al crear la convocatoria:', error);
        res.status(500).send('Error al crear la convocatoria');
    }*/
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
    const { estado, comentario_observado } = req.body;
    const { rol, id_usuario } = req.user;
    console.log (req.user);

    // Verificar que el rol sea "admin" o "vicerrectorado"
    if (rol !== 'admin' && rol !== 'vicerrectorado') {
        return res.status(403).json({ error: 'No tienes permisos para actualizar el estado de la convocatoria' });
    }

    try {
        // Si el estado se cambia a "Observado", incluir el comentario
        let query = `
            UPDATE convocatorias 
            SET estado = $1 
            WHERE id_convocatoria = $2 
            RETURNING *`;

        const values = [estado, id];

        if (estado === "Observado" && comentario_observado) {
            query = `
                UPDATE convocatorias 
                SET estado = $1, comentario_observado = $2 
                WHERE id_convocatoria = $3 
                RETURNING *`;

            values.push(comentario_observado); // Añadir comentario cuando el estado es "Observado"
        }

        const result = await pool.query(query, values);

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

module.exports = {  getConvocatoriasByFacultad, updateEstadoConvocatoria, getConvocatorias, getConvocatoriaById, createConvocatoria, updateConvocatoria, deleteConvocatoria, getConvocatoriasByEstado, getConvocatoriasByFacultadAndEstado };