// backend/controllers/convocatoriaController.js

const pool = require('../db');

// Obtener todas las convocatorias
const getConvocatorias = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT c.id_convocatoria, c.cod_convocatoria, c.nombre, c.fecha_inicio, c.fecha_fin,
                   tc.nombre_convocatoria AS nombre_tipoconvocatoria, 
                   ca.nombre_carrera AS nombre_carrera, 
                   f.nombre_facultad AS nombre_facultad
            FROM convocatorias c
            LEFT JOIN tipo_convocatoria tc ON c.id_tipoconvocatoria = tc.id_tipoconvocatoria
            LEFT JOIN carrera ca ON c.id_carrera = ca.id_carrera
            LEFT JOIN facultad f ON c.id_facultad = f.id_facultad
            ORDER BY c.cod_convocatoria
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Obtener una convocatoria por ID
const getConvocatoriaById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
            SELECT c.id_convocatoria, c.cod_convocatoria, c.nombre, c.fecha_inicio, c.fecha_fin, 
                   tc.nombre_convocatoria AS tipo_convocatoria, 
                   ca.nombre_carrera AS carrera, 
                   f.nombre_facultad AS facultad
            FROM convocatorias c
            JOIN tipo_convocatoria tc ON c.id_tipoconvocatoria = tc.id_tipoconvocatoria
            JOIN carrera ca ON c.id_carrera = ca.id_carrera
            JOIN facultad f ON c.id_facultad = f.id_facultad
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
    const { estado } = req.params; // Obtener el estado de los parámetros de la solicitud
    try {
        const result = await pool.query(`
            SELECT c.id_convocatoria, c.cod_convocatoria, c.nombre, c.fecha_inicio, c.fecha_fin,
                   tc.nombre_convocatoria AS nombre_tipoconvocatoria, 
                   ca.nombre_carrera AS nombre_carrera, 
                   f.nombre_facultad AS nombre_facultad
            FROM convocatorias c
            LEFT JOIN tipo_convocatoria tc ON c.id_tipoconvocatoria = tc.id_tipoconvocatoria
            LEFT JOIN carrera ca ON c.id_carrera = ca.id_carrera
            LEFT JOIN facultad f ON c.id_facultad = f.id_facultad
            WHERE c.estado = $1
            ORDER BY c.cod_convocatoria
        `, [estado]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Crear una nueva convocatoria
const createConvocatoria = async (req, res) => {
    try {
        const { nombre, fecha_inicio, fecha_fin, id_tipoconvocatoria, id_carrera, id_facultad } = req.body;
        const result = await pool.query(
            'INSERT INTO convocatorias (nombre, fecha_inicio, fecha_fin, id_tipoconvocatoria, id_carrera, id_facultad) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_convocatoria',
            [nombre, fecha_inicio, fecha_fin, id_tipoconvocatoria, id_carrera, id_facultad]
        );
        res.json(result.rows[0]); // Devuelve el id_convocatoria generado
    } catch (error) {
        console.error('Error creating convocatoria:', error);
        res.status(500).send('Server error');
    }
};

// Actualizar una convocatoria existente
const updateConvocatoria = async (req, res) => {
    const { id } = req.params;
    const { nombre, fecha_inicio, fecha_fin, id_tipoconvocatoria, id_carrera, id_facultad } = req.body;
    try {
        const result = await pool.query(
            'UPDATE convocatorias SET nombre = $1, fecha_inicio = $2, fecha_fin = $3, id_tipoconvocatoria = $4, id_carrera = $5, id_facultad = $6 WHERE id_convocatoria = $7 RETURNING *',
            [nombre, fecha_inicio, fecha_fin, id_tipoconvocatoria, id_carrera, id_facultad, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Convocatoria no encontrada' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Eliminar una convocatoria
const deleteConvocatoria = async (req, res) => {
    const { id_convocatoria } = req.params;
    try {
        // Primero elimina las relaciones dependientes en convocatoria_materia
        await pool.query('DELETE FROM convocatoria_materia WHERE id_convocatoria = $1', [id_convocatoria]);

        // Luego elimina las relaciones dependientes en honorarios
        await pool.query('DELETE FROM honorarios WHERE id_convocatoria = $1', [id_convocatoria]);

        // Finalmente elimina la convocatoria
        const result = await pool.query('DELETE FROM convocatorias WHERE id_convocatoria = $1 RETURNING *', [id_convocatoria]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Convocatoria no encontrada' });
        }

        res.json({ message: 'Convocatoria eliminada exitosamente' });
    } catch (error) {
        console.error('Error eliminando convocatoria:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

module.exports = { getConvocatorias, getConvocatoriaById, createConvocatoria, updateConvocatoria, deleteConvocatoria, getConvocatoriasByEstado };
 