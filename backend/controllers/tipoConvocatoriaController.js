// backend/controllers/tipoConvocatoriaController.js
const pool = require('../db');

// Obtener todos los tipos de convocatoria
exports.getAllTiposConvocatoria = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tipo_convocatoria');
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los tipos de convocatoria', error });
    }
};

// Obtener un tipo de convocatoria por ID
exports.getTipoConvocatoriaById = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tipo_convocatoria WHERE id_tipoconvocatoria = $1', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Tipo de convocatoria no encontrado' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el tipo de convocatoria', error });
    }
};

// Crear un nuevo tipo de convocatoria
exports.createTipoConvocatoria = async (req, res) => {
    const { Nombre_convocatoria, Cod_carrera, Cod_facultad } = req.body;
    try {
        // Verificar que Nombre_convocatoria no sea null o undefined
        if (!Nombre_convocatoria) {
            return res.status(400).json({ message: 'El nombre de convocatoria es requerido' });
        }

        const result = await pool.query(
            'INSERT INTO tipo_convocatoria (nombre_convocatoria, cod_carrera, cod_facultad) VALUES ($1, $2, $3) RETURNING *',
            [Nombre_convocatoria, Cod_carrera, Cod_facultad]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al crear el tipo de convocatoria:', error);
        res.status(500).json({ message: 'Error al crear el tipo de convocatoria', error });
    }
};
// Actualizar un tipo de convocatoria
exports.updateTipoConvocatoria = async (req, res) => {
    const { Nombre_convocatoria, Cod_carrera, Cod_facultad } = req.body;
    try {
        const result = await pool.query(
            'UPDATE tipo_convocatoria SET Nombre_convocatoria = $1, Cod_carrera = $2, Cod_facultad = $3 WHERE id_tipoconvocatoria = $4 RETURNING *',
            [Nombre_convocatoria, Cod_carrera, Cod_facultad, req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Tipo de convocatoria no encontrado' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status500.json({ message: 'Error al actualizar el tipo de convocatoria', error });
    }
};

// Eliminar un tipo de convocatoria
exports.deleteTipoConvocatoria = async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM tipo_convocatoria WHERE id_tipoconvocatoria = $1 RETURNING *', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Tipo de convocatoria no encontrado' });
        }
        res.status(200).json({ message: 'Tipo de convocatoria eliminado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el tipo de convocatoria', error });
    }
};

/*const pool = require('../db');

const getTipoConvocatorias = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT tc.*, f.nombre_facultad, c.nombre_carrera
             FROM tipo_convocatoria tc
             LEFT JOIN facultad f ON tc.cod_facultad = f.id_facultad
             LEFT JOIN carrera c ON tc.cod_carrera = c.id_carrera
             ORDER BY tc.nombre_convocatoria`
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createTipoConvocatoria = async (req, res) => {
    const { nombre_convocatoria } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO tipo_convocatoria (nombre_convocatoria) VALUES ($1) RETURNING *',
            [nombre_convocatoria]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        if (error.code === '23505') { // Código de error para violación de restricción de unicidad
            res.status(400).json({ message: 'El nombre de la convocatoria ya existe. Por favor, elige otro nombre.' });
        } else {
            res.status(500).json({ message: 'Error al crear tipo de convocatoria', error });
        }
    }
};

const updateTipoConvocatoria = async (req, res) => {
    const { id } = req.params;
    const { nombre_convocatoria, cod_carrera, cod_facultad } = req.body;

     // Validar y convertir valores
     if (!nombre_convocatoria || isNaN(cod_carrera) || isNaN(cod_facultad)) {
        return res.status(400).json({ error: 'Datos inválidos' });
    }
    const codCarrera = parseInt(cod_carrera, 10);
    const codFacultad = parseInt(cod_facultad, 10);
    
    try {
        const result = await pool.query(
            'UPDATE tipo_convocatoria SET nombre_convocatoria = $1, cod_carrera = $2, cod_facultad = $3 WHERE id_tipo_convocatoria = $4 RETURNING *',
            [nombre_convocatoria, codCarrera, codFacultad, id]
        );
        res.json(result.rows[0]);
    } catch (error) {

        console.error('Error al actualizar el tipo de convocatoria:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
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

module.exports = {
    getTipoConvocatorias,
    createTipoConvocatoria,
    updateTipoConvocatoria,
    deleteTipoConvocatoria,
    getTipoConvocatoriaById
};
*/