// backend/controllers/tipoConvocatoriaController.js

const pool = require('../db');

// obtener los datos de los tipos de convocatoria
exports.getAllTiposConvocatoria = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tipos_convocatorias'); 
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener los tipos de convocatoria:', error);
        res.status(500).json({ message: 'Error al obtener los tipos de convocatoria', error });
    }
};

// un tipo de convocatoria por sui ID
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

//nuevo tipo de convocatoria
exports.createTipoConvocatoria = async (req, res) => {
    const { Nombre_convocatoria, Titulo } = req.body;
    try {
        if (!Nombre_convocatoria) {
            return res.status(400).json({ message: 'El nombre de convocatoria es requerido' });
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

// Actualizar
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

exports.deleteTipoConvocatoria = async (req, res) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        const deleteHonorarios = await client.query('DELETE FROM honorarios WHERE id_convocatoria IN (SELECT id_convocatoria FROM convocatorias WHERE id_tipoconvocatoria = $1)', [req.params.id]);
        console.log('Honorarios eliminados:', deleteHonorarios.rowCount);
        const deleteConvocatoriaMaterias = await client.query('DELETE FROM convocatorias_materias WHERE id_convocatoria IN (SELECT id_convocatoria FROM convocatorias WHERE id_tipoconvocatoria = $1)', [req.params.id]);
        console.log('Convocatorias materias eliminadas:', deleteConvocatoriaMaterias.rowCount);
        const deleteConvocatorias = await client.query('DELETE FROM convocatorias WHERE id_tipoconvocatoria = $1', [req.params.id]);
        console.log('Convocatorias eliminadas:', deleteConvocatorias.rowCount);
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
