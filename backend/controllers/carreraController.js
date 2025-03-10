//backend/controllers/carreraController.js
const pool = require('../db');

// Obtener carreras (solo lectura)
const getCarreras = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM public.alm_programas ORDER BY nombre_carrera');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Obtener carrera por ID (solo lectura)
const getCarreraById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM public.alm_programas WHERE id_programa = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Carrera no encontrada' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getCarrerasByFacultad = async (req, res) => {
    const { nombre_facultad } = req.params;
    try {
        const result = await pool.query(
            `SELECT c.id_programa, c.nombre_carrera 
             FROM public.alm_programas AS c
             JOIN public.alm_programas_facultades AS f 
             ON c.v_programas_facultades = f.id_facultad
             WHERE f.nombre_facultad = $1 
             ORDER BY c.nombre_carrera`,
            [nombre_facultad]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


module.exports = { getCarreras, getCarreraById, getCarrerasByFacultad };
