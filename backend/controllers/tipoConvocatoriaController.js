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

// Obtener convocatorias por estado
const getConvocatoriasByEstado = async (req, res) => {
    const { estado } = req.params;
    try {
        const result = await pool.query(`
            SELECT c.id_convocatoria, c.cod_convocatoria, c.nombre, c.fecha_inicio, c.fecha_fin,
                   tc.nombre_convocatoria AS nombre_tipoconvocatoria, 
                   ca.nombre_carrera AS nombre_carrera, 
                   f.nombre_facultad AS nombre_facultad,
                   c.estado
            FROM convocatorias c
            LEFT JOIN tipo_convocatoria tc ON c.id_tipoconvocatoria = tc.id_tipoconvocatoria
            LEFT JOIN carrera ca ON c.id_carrera = ca.id_carrera
            LEFT JOIN facultad f ON c.id_facultad = f.id_facultad
            WHERE c.estado = $1
            ORDER BY c.cod_convocatoria
        `, [estado]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: `No se encontraron convocatorias con estado ${estado}` });
        }
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
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
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Eliminar todas las filas dependientes en convocatoria_materia
        await client.query('DELETE FROM convocatoria_materia WHERE id_convocatoria IN (SELECT id_convocatoria FROM convocatorias WHERE id_tipoconvocatoria = $1)', [req.params.id]);

        // Eliminar todas las convocatorias que referencian este tipo de convocatoria
        await client.query('DELETE FROM convocatorias WHERE id_tipoconvocatoria = $1', [req.params.id]);

        // Ahora se puede eliminar el tipo de convocatoria
        const result = await client.query('DELETE FROM tipo_convocatoria WHERE id_tipoconvocatoria = $1 RETURNING *', [req.params.id]);

        await client.query('COMMIT');

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Tipo de convocatoria no encontrado' });
        }

        res.status(200).json({ message: 'Tipo de convocatoria eliminado' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error al eliminar el tipo de convocatoria:', error);
        res.status(500).json({ message: 'Error al eliminar el tipo de convocatoria', error });
    } finally {
        client.release();
    }
};
