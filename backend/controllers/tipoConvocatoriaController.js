// backend/controllers/tipoConvocatoriaController.js
const pool = require('../db');

// Obtener todos los tipos de convocatoria
exports.getAllTiposConvocatoria = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tipo_convocatoria');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener los tipos de convocatoria:', error);
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
        console.error('Error al obtener el tipo de convocatoria:', error);
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
        console.log('Datos recibidos:', { Nombre_convocatoria, Cod_carrera, Cod_facultad, id: req.params.id });
        
        const result = await pool.query(
            'UPDATE tipo_convocatoria SET Nombre_convocatoria = $1, Cod_carrera = $2, Cod_facultad = $3 WHERE id_tipoconvocatoria = $4 RETURNING *',
            [Nombre_convocatoria, Cod_carrera, Cod_facultad, req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Tipo de convocatoria no encontrado' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error al actualizar el tipo de convocatoria:', error);
        res.status(500).json({ message: 'Error al actualizar el tipo de convocatoria', error });
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
        console.error('Error al eliminar el tipo de convocatoria:', error);
        res.status(500).json({ message: 'Error al eliminar el tipo de convocatoria', error });
    }
};
