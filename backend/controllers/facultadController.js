//backend/controllers/facultadController.js
const pool = require('../db');

const getFacultades = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id_facultad, facultad as nombre_facultad, nombre_decano 
            FROM datos_universidad.alm_programas_facultades 
            ORDER BY facultad
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener facultades:', error);
        res.status(500).json({ 
            error: 'Error al obtener facultades', 
            details: error.message 
        });
    }
};

const getTipoConvocatorias = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT tc.id_tipoconvocatoria, tc.nombre_convocatoria, 
                    f.facultad as nombre_facultad, p.programa as nombre_carrera
            FROM tipos_convocatorias tc
            INNER JOIN datos_universidad.alm_programas_facultades f ON tc.cod_facultad = f.id_facultad
            INNER JOIN datos_universidad.alm_programas p ON tc.cod_carrera = p.id_programa
            ORDER BY tc.nombre_convocatoria
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Error al obtener tipos de convocatorias:', err);
        res.status(500).json({ 
            error: 'Error al obtener tipos de convocatorias', 
            details: err.message 
        });
    }
};

const getFacultadById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
            SELECT id_facultad, facultad as nombre_facultad, nombre_decano
            FROM datos_universidad.alm_programas_facultades 
            WHERE id_facultad = $1
        `, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Facultad no encontrada' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error al obtener facultad por ID:', err);
        res.status(500).json({ 
            error: 'Error al obtener facultad', 
            details: err.message 
        });
    }
};

module.exports = { getFacultades, getFacultadById, getTipoConvocatorias };