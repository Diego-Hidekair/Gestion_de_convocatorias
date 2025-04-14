//backend/controllers/carreraController.js
const pool = require('../db');
//ver las carreras
const getCarreras = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT p.id_programa, p.programa, f.facultad as nombre_facultad
            FROM datos_universidad.alm_programas p
            LEFT JOIN datos_universidad.alm_programas_facultades f ON p.id_facultad = f.id_facultad
            ORDER BY p.programa
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Error al obtener carreras:', err);
        res.status(500).json({ error: 'Error al obtener carreras', details: err.message });
    }
};
//carrera por codigo
const getCarreraById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
            SELECT p.id_programa, p.programa, f.facultad as nombre_facultad
            FROM datos_universidad.alm_programas p
            LEFT JOIN datos_universidad.alm_programas_facultades f ON p.id_facultad = f.id_facultad
            WHERE p.id_programa = $1
        `, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Carrera no encontrada' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error al obtener carrera por ID:', err);
        res.status(500).json({ error: 'Error al obtener carrera', details: err.message });
    }
};

const getCarrerasByFacultad = async (req, res) => {
    const { nombre_facultad } = req.params;
    try {
        const result = await pool.query(`
            SELECT p.id_programa, p.programa as nombre_carrera
            FROM datos_universidad.alm_programas p
            JOIN datos_universidad.alm_programas_facultades f ON p.id_facultad = f.id_facultad
            WHERE f.facultad = $1
            ORDER BY p.programa
        `, [nombre_facultad]);
        
        res.json(result.rows);
    } catch (err) {
        console.error('Error al obtener carreras por facultad:', err);
        res.status(500).json({ 
            error: 'Error al obtener carreras por facultad', 
            details: err.message 
        });
    }
};

const getCarrerasByFacultadId = async (req, res) => {
    const { id_facultad } = req.params;
    try {
        const result = await pool.query(`
            SELECT id_programa, programa as nombre_carrera
            FROM datos_universidad.alm_programas
            WHERE id_facultad = $1
            ORDER BY programa
        `, [id_facultad]);
        
        res.json(result.rows);
    } catch (err) {
        console.error('Error al obtener carreras por ID de facultad:', err);
        res.status(500).json({ 
            error: 'Error al obtener carreras por facultad', 
            details: err.message 
        });
    }
};

module.exports = { getCarreras, getCarreraById, getCarrerasByFacultad, getCarrerasByFacultadId};
