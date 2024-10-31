const pool = require('../db');

const getFacultades = async (req, res) => {//mostar las facutlades
    try {
        const result = await pool.query('SELECT * FROM public.alm_programas_facultades ORDER BY nombre_facultad');
        res.json(result.rows);
    } catch (error) {
        res.status(500).send('Error al obtener facultades');
    }
};

const getTipoConvocatorias = async (req, res) => {//obtenerlos dattos de las facultades
    try {
        const result = await pool.query(`
            SELECT tc.id_tipoconvocatoria, tc.nombre_convocatoria, 
            f.nombre_facultad, c.nombre_carrera
            FROM tipos_convocatorias tc
            INNER JOIN public.alm_programas_facultades f ON tc.cod_facultad = f.id_facultad
            INNER JOIN carrera c ON tc.cod_carrera = c.id_carrera
            ORDER BY tc.nombre_convocatoria
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getFacultadById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM public.alm_programas_facultades WHERE id_facultad = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Facultad no encontrada' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};




module.exports = { getFacultades, getFacultadById, getTipoConvocatorias };
