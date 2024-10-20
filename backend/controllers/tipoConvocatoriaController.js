// backend/controllers/tipoConvocatoriaController.js

const pool = require('../db');

// mostrar los tipos de convocatoria
exports.getAllTiposConvocatoria = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tipos_convocatorias');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener los tipos de convocatoria:', error);
        res.status(500).json({ message: 'Error al obtener los tipos de convocatoria', error });
    }
};

// mostrar el tipo de convocatoria pro la id 
exports.getTipoConvocatoriaById = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tipos_convocatorias WHERE id_tipoconvocatoria = $1', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Tipo de convocatoria no encontrado' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener el tipo de convocatoria:', error);
        res.status(500).json({ message: 'Error al obtener el tipo de convocatoria', error });
    }
};

// nuevo convocatoria
exports.createTipoConvocatoria = async (req, res) => {
    const { Nombre_convocatoria, Titulo } = req.body;
    try {
        if (!Nombre_convocatoria) {
            return res.status(400).json({ message: 'El nombre de la convocatoria es requerido' });
        }

        const result = await pool.query(
            'INSERT INTO tipos_convocatorias (Nombre_convocatoria, Titulo) VALUES ($1, $2) RETURNING *',
            [Nombre_convocatoria, Titulo]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al crear el tipo de convocatoria:', error);
        res.status(500).json({ message: 'Error al crear el tipo de convocatoria', error });
    }
};

// actualizar
exports.updateTipoConvocatoria = async (req, res) => {
    const { Nombre_convocatoria, Titulo } = req.body;
    try {
        const result = await pool.query(
            'UPDATE tipos_convocatorias SET Nombre_convocatoria = $1, Titulo = $2 WHERE id_tipoconvocatoria = $3 RETURNING *',
            [Nombre_convocatoria, Titulo, req.params.id]
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

// borrar
exports.deleteTipoConvocatoria = async (req, res) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        await client.query('DELETE FROM honorarios WHERE id_convocatoria IN (SELECT id_convocatoria FROM convocatorias WHERE id_tipoconvocatoria = $1)', [req.params.id]);
        await client.query('DELETE FROM convocatorias_materias WHERE id_convocatoria IN (SELECT id_convocatoria FROM convocatorias WHERE id_tipoconvocatoria = $1)', [req.params.id]);
        await client.query('DELETE FROM convocatorias WHERE id_tipoconvocatoria = $1', [req.params.id]);
        const result = await client.query('DELETE FROM tipos_convocatorias WHERE id_tipoconvocatoria = $1 RETURNING *', [req.params.id]);
        await client.query('COMMIT');

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Tipo de convocatoria no encontrado' });
        }
        res.status(200).json({ message: 'Tipo de convocatoria eliminado' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(`Error al eliminar el tipo de convocatoria con id ${req.params.id}:`, error.message);
        res.status(500).json({ message: 'Error al eliminar el tipo de convocatoria', error: error.message });
    } finally {
        client.release();
    }
};