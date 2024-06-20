// controllers/categoriaController.js
const pool = require('../db');

// CRUD para Facultades
const getFacultades = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM categoria_facultad');
        res.json(result.rows);
    } catch (error) {
        res.status(500).send('Error al obtener facultades');
    }
};

const createFacultad = async (req, res) => {
    const { nombre_facultad } = req.body;
    try {
        const result = await pool.query('INSERT INTO categoria_facultad (nombre_facultad) VALUES ($1) RETURNING *', [nombre_facultad]);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateFacultad = async (req, res) => {
    const { id } = req.params;
    const { nombre_facultad } = req.body;
    try {
        const result = await pool.query('UPDATE categoria_facultad SET nombre_facultad = $1 WHERE cod_facultad = $2 RETURNING *', [nombre_facultad, id]);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteFacultad = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM categoria_facultad WHERE cod_facultad = $1', [id]);
        res.json({ message: 'Facultad eliminada' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Obtener facultad por ID
const getFacultadById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM categoria_facultad WHERE cod_facultad = $1', [id]);
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
        const result = await pool.query('SELECT * FROM categoria_carrera');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createCarrera = async (req, res) => {
    const { nombre_carrera, cod_facultad } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO categoria_carrera (nombre_carrera, cod_facultad) VALUES ($1, $2) RETURNING *',
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
            'UPDATE categoria_carrera SET nombre_carrera = $1, cod_facultad = $2 WHERE cod_carrera = $3 RETURNING *',
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


// Eliminar una carrera
const deleteCarrera = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'DELETE FROM categoria_carrera WHERE cod_carrera = $1 RETURNING *',
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
        const result = await pool.query('SELECT * FROM categoria_carrera WHERE cod_carrera = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Carrera no encontrada' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// CRUD para Convocatorias
const getConvocatorias = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM categoria_convocatoria');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createConvocatoria = async (req, res) => {
    const { nombre_convocatoria, cod_carrera, cod_facultad } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO categoria_convocatoria (nombre_convocatoria, cod_carrera, cod_facultad) VALUES ($1, $2, $3) RETURNING *',
            [nombre_convocatoria, cod_carrera, cod_facultad]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateConvocatoria = async (req, res) => {
    const { id } = req.params;
    const { nombre_convocatoria, cod_carrera, cod_facultad } = req.body;
    try {
        const result = await pool.query(
            'UPDATE categoria_convocatoria SET nombre_convocatoria = $1, cod_carrera = $2, cod_facultad = $3 WHERE cod_convocatoria = $4 RETURNING *',
            [nombre_convocatoria, cod_carrera, cod_facultad, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Convocatoria no encontrada' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteConvocatoria = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM categoria_convocatoria WHERE cod_convocatoria = $1', [id]);
        res.json({ message: 'Convocatoria eliminada' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Obtener convocatoria por ID
const getConvocatoriaById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM categoria_convocatoria WHERE cod_convocatoria = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Convocatoria no encontrada' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getFacultades, createFacultad, updateFacultad, deleteFacultad, getFacultadById, getCarreras, createCarrera, updateCarrera, deleteCarrera, getCarreraById, getConvocatorias, createConvocatoria, updateConvocatoria, deleteConvocatoria, getConvocatoriaById
};