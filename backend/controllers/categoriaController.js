// controllers/categoriaController.js
const pool = require('../db');

// CRUD para Facultades
const getFacultades = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM facultad ORDER BY nombre_facultad');
        res.json(result.rows);
    } catch (error) {
        res.status(500).send('Error al obtener facultades');
    }
};

const createFacultad = async (req, res) => {
    const { nombre_facultad } = req.body;
    try {
        const result = await pool.query('INSERT INTO facultad (nombre_facultad) VALUES ($1) RETURNING *', [nombre_facultad]);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateFacultad = async (req, res) => {
    const { id } = req.params;
    const { nombre_facultad } = req.body;
    try {
        const result = await pool.query('UPDATE facultad SET nombre_facultad = $1 WHERE id_facultad = $2 RETURNING *', [nombre_facultad, id]);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteFacultad = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM facultad WHERE id_facultad = $1', [id]);
        res.json({ message: 'Facultad eliminada' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Obtener facultad por ID
const getFacultadById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM facultad WHERE id_facultad = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Facultad no encontrada' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// CRUD para Carreras
const getCarreras = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM carrera ORDER BY nombre_carrera');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createCarrera = async (req, res) => {
    const { nombre_carrera, cod_facultad } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO carrera (nombre_carrera, cod_facultad) VALUES ($1, $2) RETURNING *',
            [nombre_carrera, cod_facultad]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateCarrera = async (req, res) => {
    const { id } = req.params;
    const { nombre_carrera, cod_facultad } = req.body;
    try {
        const result = await pool.query(
            'UPDATE carrera SET nombre_carrera = $1, cod_facultad = $2 WHERE id_carrera = $3 RETURNING *',
            [nombre_carrera, cod_facultad, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Carrera no encontrada' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteCarrera = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'DELETE FROM carrera WHERE id_carrera = $1 RETURNING *',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Carrera no encontrada' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Obtener carrera por ID
const getCarreraById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM carrera WHERE id_carrera = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Carrera no encontrada' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// CRUD para Tipo Convocatorias
const getTipoConvocatorias = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tipo_convocatoria ORDER BY nombre_convocatoria');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createTipoConvocatoria = async (req, res) => {
    const { nombre_convocatoria, cod_carrera, cod_facultad } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO tipo_convocatoria (nombre_convocatoria, cod_carrera, cod_facultad) VALUES ($1, $2, $3) RETURNING *',
            [nombre_convocatoria, cod_carrera, cod_facultad]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateTipoConvocatoria = async (req, res) => {
    const { id } = req.params;
    const { nombre_convocatoria, cod_carrera, cod_facultad } = req.body;
    try {
        const result = await pool.query(
            'UPDATE tipo_convocatoria SET nombre_convocatoria = $1, cod_carrera = $2, cod_facultad = $3 WHERE id_tipoconvocatoria = $4 RETURNING *',
            [nombre_convocatoria, cod_carrera, cod_facultad, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteTipoConvocatoria = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM tipo_convocatoria WHERE id_tipoconvocatoria = $1', [id]);
        res.json({ message: 'Tipo de convocatoria eliminada' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Obtener tipo convocatoria por ID
const getTipoConvocatoriaById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM tipo_convocatoria WHERE id_tipoconvocatoria = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Tipo de convocatoria no encontrada' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


module.exports = { getFacultades, createFacultad, updateFacultad, deleteFacultad, getFacultadById, getCarreras, createCarrera, updateCarrera, deleteCarrera, getCarreraById, getTipoConvocatorias, createTipoConvocatoria, updateTipoConvocatoria, deleteTipoConvocatoria, getTipoConvocatoriaById};