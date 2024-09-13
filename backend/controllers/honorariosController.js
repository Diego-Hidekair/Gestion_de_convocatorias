// backend/controllers/honorariosController.js

const pool = require('../db');

// Obtener todos los honorarios
exports.getHonorarios = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT h.id_honorario, h.id_convocatoria, h.id_tipoconvocatoria, h.pago_mensual,
                   c.nombre AS nombre_convocatoria, 
                   tc.nombre_convocatoria AS nombre_tipoconvocatoria
            FROM honorarios h
            LEFT JOIN convocatorias c ON h.id_convocatoria = c.id_convocatoria
            LEFT JOIN tipo_convocatoria tc ON h.id_tipoconvocatoria = tc.id_tipoconvocatoria
            ORDER BY h.id_honorario
        `);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener los honorarios:', error);
        res.status(500).json({ message: 'Error al obtener los honorarios' });
    }
};

// Obtener un honorario por ID
exports.getHonorarioById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
            SELECT h.id_honorario, h.id_convocatoria, h.id_tipoconvocatoria, h.pago_mensual,
                   c.nombre AS nombre_convocatoria, 
                   tc.nombre_convocatoria AS nombre_tipoconvocatoria
            FROM honorarios h
            LEFT JOIN convocatorias c ON h.id_convocatoria = c.id_convocatoria
            LEFT JOIN tipo_convocatoria tc ON h.id_tipoconvocatoria = tc.id_tipoconvocatoria
            WHERE h.id_honorario = $1
        `, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Honorario no encontrado' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener el honorario:', error);
        res.status(500).json({ message: 'Error al obtener el honorario' });
    }
};

// Crear un nuevo honorario
// Crear un nuevo honorario
exports.crearHonorario = async (req, res) => {
    const { id_convocatoria, id_tipoconvocatoria, pago_mensual } = req.body;

    try {
        // Validar que el id_tipoconvocatoria coincide con la convocatoria seleccionada
        const convocatoriaResult = await pool.query(
            'SELECT id_tipoconvocatoria FROM convocatorias WHERE id_convocatoria = $1',
            [id_convocatoria]
        );
        
        if (convocatoriaResult.rows.length === 0) {
            return res.status(404).json({ message: 'Convocatoria no encontrada' });
        }

        const convocatoriaTipo = convocatoriaResult.rows[0].id_tipoconvocatoria;

        if (parseInt(convocatoriaTipo, 10) !== parseInt(id_tipoconvocatoria, 10)) {
            return res.status(400).json({ message: 'El tipo de convocatoria no coincide con la convocatoria seleccionada' });
        }

        // Insertar el nuevo honorario si todo está bien
        const result = await pool.query(
            'INSERT INTO honorarios (id_convocatoria, id_tipoconvocatoria, pago_mensual) VALUES ($1, $2, $3) RETURNING *',
            [id_convocatoria, id_tipoconvocatoria, pago_mensual]
        ); 
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al crear el honorario:', error);
        res.status(500).json({ message: 'Error al crear el honorario' });
    }
};

// Actualizar un honorario existente
exports.updateHonorario = async (req, res) => {
    const { id } = req.params;
    const { id_convocatoria, id_tipoconvocatoria, pago_mensual } = req.body;

    try {
        const result = await pool.query(
            'UPDATE honorarios SET id_convocatoria = $1, id_tipoconvocatoria = $2, pago_mensual = $3 WHERE id_honorario = $4 RETURNING *',
            [id_convocatoria, id_tipoconvocatoria, pago_mensual, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Honorario no encontrado' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error al actualizar el honorario:', error);
        res.status(500).json({ message: 'Error al actualizar el honorario' });
    }
};

// Eliminar un honorario
exports.deleteHonorario = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('DELETE FROM honorarios WHERE id_honorario = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Honorario no encontrado' });
        }

        res.status(200).json({ message: 'Honorario eliminado' });
    } catch (error) {
        console.error('Error al eliminar el honorario:', error);
        res.status(500).json({ message: 'Error al eliminar el honorario' });
    }
};

// Obtener todas las convocatorias con su tipo de convocatoria
exports.getConvocatorias = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT c.id_convocatoria, c.nombre, tc.nombre_convocatoria AS tipo_convocatoria_nombre
            FROM convocatorias c
            LEFT JOIN tipo_convocatoria tc ON c.id_tipoconvocatoria = tc.id_tipoconvocatoria
        `);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener las convocatorias:', error);
        res.status(500).json({ message: 'Error al obtener las convocatorias' });
    }
};

/*// backend/controllers/honorariosController.js

const pool = require('../db');

// Obtener todos los honorarios
exports.getHonorarios = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT h.id_honorario, h.id_convocatoria, h.id_tipoconvocatoria, h.pago_mensual,
                   c.nombre AS nombre_convocatoria, 
                   tc.nombre_convocatoria AS nombre_tipoconvocatoria
            FROM honorarios h
            LEFT JOIN convocatorias c ON h.id_convocatoria = c.id_convocatoria
            LEFT JOIN tipo_convocatoria tc ON h.id_tipoconvocatoria = tc.id_tipoconvocatoria
            ORDER BY h.id_honorario
        `);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener los honorarios:', error);
        res.status(500).json({ message: 'Error al obtener los honorarios' });
    }
};

// Obtener un honorario por ID
exports.getHonorarioById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
            SELECT h.id_honorario, h.id_convocatoria, h.id_tipoconvocatoria, h.pago_mensual,
                   c.nombre AS nombre_convocatoria, 
                   tc.nombre_convocatoria AS nombre_tipoconvocatoria
            FROM honorarios h
            LEFT JOIN convocatorias c ON h.id_convocatoria = c.id_convocatoria
            LEFT JOIN tipo_convocatoria tc ON h.id_tipoconvocatoria = tc.id_tipoconvocatoria
            WHERE h.id_honorario = $1
        `, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Honorario no encontrado' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener el honorario:', error);
        res.status(500).json({ message: 'Error al obtener el honorario' });
    }
};

// Crear un nuevo honorario
exports.createHonorario = async (req, res) => {
    const { id_convocatoria, id_tipoconvocatoria, pago_mensual } = req.body;

    try {
        const result = await pool.query(
            'INSERT INTO honorarios (id_convocatoria, id_tipoconvocatoria, pago_mensual) VALUES ($1, $2, $3) RETURNING *',
            [id_convocatoria, id_tipoconvocatoria, pago_mensual]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al crear el honorario:', error);
        res.status(500).json({ message: 'Error al crear el honorario' });
    }
};

// Actualizar un honorario existente
exports.updateHonorario = async (req, res) => {
    const { id } = req.params;
    const { id_convocatoria, id_tipoconvocatoria, pago_mensual } = req.body;

    try {
        const result = await pool.query(
            'UPDATE honorarios SET id_convocatoria = $1, id_tipoconvocatoria = $2, pago_mensual = $3 WHERE id_honorario = $4 RETURNING *',
            [id_convocatoria, id_tipoconvocatoria, pago_mensual, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Honorario no encontrado' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error al actualizar el honorario:', error);
        res.status(500).json({ message: 'Error al actualizar el honorario' });
    }
};

// Eliminar un honorario
exports.deleteHonorario = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('DELETE FROM honorarios WHERE id_honorario = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Honorario no encontrado' });
        }

        res.status(200).json({ message: 'Honorario eliminado' });
    } catch (error) {
        console.error('Error al eliminar el honorario:', error);
        res.status(500).json({ message: 'Error al eliminar el honorario' });
    }
};*/