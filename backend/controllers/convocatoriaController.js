// backend/controllers/convocatoriaController.js
const pool = require('../db');

const getConvocatorias = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                c.id_convocatoria, 
                c.cod_convocatoria, 
                c.nombre, 
                c.fecha_inicio, 
                c.fecha_fin, 
                tc.nombre_convocatoria AS tipo_convocatoria,
                ca.Nombre_carrera AS carrera,
                f.Nombre_facultad AS facultad
            FROM convocatorias c
            LEFT JOIN tipo_convocatoria tc ON c.id_tipoconvocatoria = tc.id_tipoconvocatoria
            LEFT JOIN carrera ca ON c.id_carrera = ca.id_carrera
            LEFT JOIN facultad f ON c.id_facultad = f.id_facultad
            ORDER BY c.fecha_inicio
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener convocatorias:', error);
        res.status(500).send('Error al obtener convocatorias');
    }
};

// Crear una nueva convocatoria
const createConvocatoria = async (req, res) => {
    const { cod_convocatoria, nombre, fechaInicio, fechaFin, tipoConvocatoria, carrera, facultad, creadoPor } = req.body;
    console.log('Datos recibidos para crear convocatoria:', req.body);

    try {
        const result = await pool.query(
            `INSERT INTO convocatorias (cod_convocatoria, nombre, fecha_inicio, fecha_fin, id_tipoconvocatoria, id_carrera, id_facultad) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id_convocatoria`,
            [cod_convocatoria, nombre, fechaInicio, fechaFin, tipoConvocatoria, carrera, facultad]
        );
        res.status(201).json({ id_convocatoria: result.rows[0].id_convocatoria });
    } catch (error) {
        console.error('Error al crear la convocatoria:', error);
        res.status(500).json({ message: 'Error al crear la convocatoria' });
    }
};

/*const createConvocatoria = async (req, res) => {
    const { cod_convocatoria, nombre, fecha_inicio, fecha_fin, id_tipoconvocatoria, id_carrera, id_facultad } = req.body;
    try {
        console.log('Datos recibidos para crear convocatoria:', req.body);
        const result = await pool.query(
            'INSERT INTO convocatorias (cod_convocatoria, nombre, fecha_inicio, fecha_fin, id_tipoconvocatoria, id_carrera, id_facultad) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [cod_convocatoria, nombre, fecha_inicio, fecha_fin, id_tipoconvocatoria, id_carrera, id_facultad]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error al crear convocatoria:', err);
        res.status(500).json({ error: err.message });
    }
};*/

const updateConvocatoria = async (req, res) => {
    const { id } = req.params;
    const { cod_convocatoria, nombre, fecha_inicio, fecha_fin, id_tipoconvocatoria, id_carrera, id_facultad } = req.body;
    try {
        const result = await pool.query(
            'UPDATE convocatorias SET cod_convocatoria = $1, nombre = $2, fecha_inicio = $3, fecha_fin = $4, id_tipoconvocatoria = $5, id_carrera = $6, id_facultad = $7 WHERE id_convocatoria = $8 RETURNING *',
            [cod_convocatoria, nombre, fecha_inicio, fecha_fin, id_tipoconvocatoria, id_carrera, id_facultad, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Convocatoria no encontrada' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error al actualizar convocatoria:', err);
        res.status(500).json({ error: err.message });
    }
};

const deleteConvocatoria = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM convocatorias WHERE id_convocatoria = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Convocatoria no encontrada' });
        }
        res.json({ message: 'Convocatoria eliminada' });
    } catch (err) {
        console.error('Error al eliminar convocatoria:', err);
        res.status(500).json({ error: err.message });
    }
};

const getConvocatoriaById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
            SELECT 
                c.id_convocatoria, 
                c.cod_convocatoria, 
                c.nombre, 
                c.fecha_inicio, 
                c.fecha_fin, 
                tc.nombre_convocatoria AS tipo_convocatoria,
                ca.Nombre_carrera AS carrera,
                f.Nombre_facultad AS facultad
            FROM convocatorias c
            LEFT JOIN tipo_convocatoria tc ON c.id_tipoconvocatoria = tc.id_tipoconvocatoria
            LEFT JOIN carrera ca ON c.id_carrera = ca.id_carrera
            LEFT JOIN facultad f ON c.id_facultad = f.id_facultad
            WHERE c.id_convocatoria = $1
        `, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Convocatoria no encontrada' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error al obtener convocatoria:', err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getConvocatorias,
    createConvocatoria,
    updateConvocatoria,
    deleteConvocatoria,
    getConvocatoriaById
};

