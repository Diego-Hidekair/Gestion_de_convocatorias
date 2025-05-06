// backend/controllers/tipoConvocatoriaController.js
const pool = require('../db');

// Obtener todos los tipos de convocatoria
const getAllTiposConvocatoria = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                id_tipoconvocatoria, 
                nombre_tipo_conv AS nombre_convocatoria,
                titulo_tipo_conv AS titulo
            FROM tipos_convocatorias
            ORDER BY nombre_tipo_conv
        `);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener los tipos de convocatoria:', error);
        res.status(500).json({ 
            message: 'Error al obtener los tipos de convocatoria',
            error: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
};

// Obtener un tipo de convocatoria por ID
const getTipoConvocatoriaById = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                id_tipoconvocatoria, 
                nombre_tipo_conv AS nombre_convocatoria,
                titulo_tipo_conv AS titulo
            FROM tipos_convocatorias 
            WHERE id_tipoconvocatoria = $1
        `, [req.params.id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Tipo de convocatoria no encontrado' });
        }
        
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener el tipo de convocatoria:', error);
        res.status(500).json({ 
            message: 'Error al obtener el tipo de convocatoria',
            error: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
};

// Crear nuevo tipo de convocatoria
const createTipoConvocatoria = async (req, res) => {
    const { nombre_convocatoria, titulo } = req.body;
    
    try {
        if (!nombre_convocatoria || !titulo) {
            return res.status(400).json({ 
                message: 'Todos los campos son requeridos',
                required: {
                    nombre_convocatoria: !nombre_convocatoria,
                    titulo: !titulo
                }
            });
        }

        const result = await pool.query(
            `INSERT INTO tipos_convocatorias 
                (nombre_tipo_conv, titulo_tipo_conv) 
             VALUES ($1, $2) 
             RETURNING 
                id_tipoconvocatoria, 
                nombre_tipo_conv AS nombre_convocatoria,
                titulo_tipo_conv AS titulo`,
            [nombre_convocatoria, titulo]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al crear el tipo de convocatoria:', error);
        
        let errorMessage = 'Error al crear el tipo de convocatoria';
        if (error.code === '23505') {
            errorMessage = 'El nombre de convocatoria ya existe';
        }
        
        res.status(500).json({ 
            message: errorMessage,
            error: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
};

// Actualizar tipo de convocatoria
const updateTipoConvocatoria = async (req, res) => {
    const { id } = req.params;
    const { nombre_convocatoria, titulo } = req.body;
    
    try {
        if (!nombre_convocatoria || !titulo) {
            return res.status(400).json({ 
                message: 'Todos los campos son requeridos'
            });
        }

        const result = await pool.query(
            `UPDATE tipos_convocatorias 
             SET 
                nombre_tipo_conv = $1,
                titulo_tipo_conv = $2
             WHERE id_tipoconvocatoria = $3
             RETURNING 
                id_tipoconvocatoria, 
                nombre_tipo_conv AS nombre_convocatoria,
                titulo_tipo_conv AS titulo`,
            [nombre_convocatoria, titulo, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Tipo de convocatoria no encontrado' });
        }
        
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error al actualizar el tipo de convocatoria:', error);
        
        let errorMessage = 'Error al actualizar el tipo de convocatoria';
        if (error.code === '23505') {
            errorMessage = 'El nombre de convocatoria ya existe';
        }
        
        res.status(500).json({ 
            message: errorMessage,
            error: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
};

// Eliminar tipo de convocatoria
const deleteTipoConvocatoria = async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        
        // Verificar si hay convocatorias asociadas
        const convocatoriasAsociadas = await client.query(
            'SELECT 1 FROM convocatorias WHERE id_tipoconvocatoria = $1 LIMIT 1',
            [id]
        );
        
        if (convocatoriasAsociadas.rows.length > 0) {
            return res.status(400).json({ 
                message: 'No se puede eliminar, hay convocatorias asociadas a este tipo' 
            });
        }
        
        const result = await client.query(
            'DELETE FROM tipos_convocatorias WHERE id_tipoconvocatoria = $1 RETURNING *',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Tipo de convocatoria no encontrado' });
        }
        
        await client.query('COMMIT');
        res.status(200).json({ 
            message: 'Tipo de convocatoria eliminado',
            deleted: result.rows[0] 
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error al eliminar el tipo de convocatoria:', error);
        res.status(500).json({ 
            message: 'Error al eliminar el tipo de convocatoria',
            error: process.env.NODE_ENV === 'development' ? error.message : null
        });
    } finally {
        client.release();
    }
};

module.exports = { getAllTiposConvocatoria, getTipoConvocatoriaById, createTipoConvocatoria, updateTipoConvocatoria, deleteTipoConvocatoria};