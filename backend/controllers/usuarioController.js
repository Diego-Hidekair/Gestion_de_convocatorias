// backend/controllers/usuarioController.js
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { upload } = require('../config/multerConfig'); // Mover multer a archivo separado

const UserController = {
    // Obtener todos los usuarios con paginación
    async getUsuarios(req, res) {
        try {
            const { page = 1, limit = 10, search } = req.query;
            const offset = (page - 1) * limit;
            
            let query = `
                SELECT 
                    u.id_usuario, u.nombres, u.apellido_paterno, u.apellido_materno, 
                    u.rol, u.celular, u.id_programa,
                    p.programa AS nombre_programa,
                    f.facultad AS nombre_facultad
                FROM usuarios u
                LEFT JOIN datos_universidad.alm_programas p ON u.id_programa = p.id_programa
                LEFT JOIN datos_universidad.alm_programas_facultades f ON p.id_facultad = f.id_facultad
            `;
            
            let countQuery = 'SELECT COUNT(*) FROM usuarios';
            const queryParams = [];
            const countParams = [];
            let paramIndex = 1;
    
            // Añadir búsqueda si existe
            if (search) {
                const searchTerm = `%${search}%`;
                const searchCondition = `
                    WHERE u.id_usuario ILIKE $${paramIndex} OR
                    u.nombres ILIKE $${paramIndex} OR
                    u.apellido_paterno ILIKE $${paramIndex} OR
                    u.apellido_materno ILIKE $${paramIndex}
                `;
                query += searchCondition;
                countQuery += ' WHERE id_usuario ILIKE $1 OR nombres ILIKE $1 OR apellido_paterno ILIKE $1 OR apellido_materno ILIKE $1';
                
                queryParams.push(searchTerm);
                countParams.push(searchTerm);
                paramIndex++;
            }
    
            query += ` ORDER BY u.apellido_paterno, u.apellido_materno, u.nombres LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
            queryParams.push(parseInt(limit));
            queryParams.push(offset);
    
            const [usersResult, countResult] = await Promise.all([
                pool.query(query, queryParams),
                pool.query(countQuery, countParams)
            ]);
    
            const totalUsers = parseInt(countResult.rows[0].count);
            const totalPages = Math.ceil(totalUsers / limit);
    
            res.json({
                data: usersResult.rows,
                pagination: {
                    total: totalUsers,
                    totalPages,
                    currentPage: parseInt(page),
                    perPage: parseInt(limit)
                }
            });
        } catch (error) {
            console.error('Error al obtener usuarios:', error);
            res.status(500).json({ 
                error: 'Error al obtener usuarios',
                details: process.env.NODE_ENV === 'development' ? error.message : null
            });
        }
    },

    // Crear un nuevo usuario
    async createUser(req, res) {
        try {
            // Validar campos obligatorios
            const requiredFields = ['id_usuario', 'nombres', 'apellido_paterno', 'rol', 'contraseña'];
            const missingFields = requiredFields.filter(field => !req.body[field]);
            
            if (missingFields.length > 0) {
                return res.status(400).json({
                    error: 'Campos obligatorios faltantes',
                    missing: missingFields
                });
            }

            // Verificar si usuario ya existe
            const userExists = await pool.query(
                'SELECT 1 FROM usuarios WHERE id_usuario = $1', 
                [req.body.id_usuario]
            );
            
            if (userExists.rows.length > 0) {
                return res.status(400).json({ error: 'El ID de usuario ya existe' });
            }

            // Hashear contraseña
            const hashedPassword = await bcrypt.hash(req.body.contraseña, 10);

            // Insertar en BD
            const result = await pool.query(
                `INSERT INTO usuarios (
                    id_usuario, nombres, apellido_paterno, apellido_materno, 
                    rol, contraseña, celular, id_programa, foto_perfil
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
                RETURNING id_usuario, nombres, apellido_paterno, apellido_materno, rol, celular, id_programa`,
                [
                    req.body.id_usuario,
                    req.body.nombres,
                    req.body.apellido_paterno,
                    req.body.apellido_materno || null,
                    req.body.rol,
                    hashedPassword,
                    req.body.celular || null,
                    req.body.id_programa || null,
                    req.file ? req.file.buffer : null
                ]
            );

            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error('Error al crear usuario:', error);
            
            let errorMessage = 'Error en el servidor';
            if (error.code === '23505') {
                errorMessage = 'El ID de usuario ya existe';
            } else if (error.code === '23503') {
                errorMessage = 'El programa especificado no existe';
            }

            res.status(500).json({ 
                error: errorMessage,
                details: process.env.NODE_ENV === 'development' ? error.message : null
            });
        }
    },

    // Obtener usuario por ID
    async getUsuarioById(req, res) {
        try {
            const { id_usuario } = req.params;

            const result = await pool.query(`
                SELECT 
                    u.id_usuario, u.nombres, u.apellido_paterno, u.apellido_materno, 
                    u.rol, u.celular, u.id_programa,
                    p.programa AS nombre_programa,
                    f.facultad AS nombre_facultad
                FROM usuarios u
                LEFT JOIN datos_universidad.alm_programas p ON u.id_programa = p.id_programa
                LEFT JOIN datos_universidad.alm_programas_facultades f ON p.id_facultad = f.id_facultad
                WHERE u.id_usuario = $1
            `, [id_usuario]);

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error al obtener usuario:', error);
            res.status(500).json({ 
                error: 'Error al obtener usuario',
                details: process.env.NODE_ENV === 'development' ? error.message : null
            });
        }
    },

    // Actualizar usuario
    async updateUser(req, res) {
        try {
            const { id_usuario } = req.params;
            const updates = req.body;
            const file = req.file;

            // Verificar si el usuario existe
            const userCheck = await pool.query(
                'SELECT 1 FROM usuarios WHERE id_usuario = $1', 
                [id_usuario]
            );
            
            if (userCheck.rows.length === 0) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            // Construir la consulta dinámicamente
            let query = 'UPDATE usuarios SET ';
            const values = [];
            let paramIndex = 1;
            const setClauses = [];

            // Campos permitidos para actualización
            const allowedFields = [
                'nombres', 'apellido_paterno', 'apellido_materno', 
                'rol', 'celular', 'id_programa'
            ];

            // Procesar campos regulares
            allowedFields.forEach(field => {
                if (updates[field] !== undefined) {
                    setClauses.push(`${field} = $${paramIndex}`);
                    values.push(updates[field]);
                    paramIndex++;
                }
            });

            // Procesar contraseña si se proporciona
            if (updates.contraseña) {
                const hashedPassword = await bcrypt.hash(updates.contraseña, 10);
                setClauses.push(`contraseña = $${paramIndex}`);
                values.push(hashedPassword);
                paramIndex++;
            }

            // Procesar foto de perfil si se subió
            if (file) {
                setClauses.push(`foto_perfil = $${paramIndex}`);
                values.push(file.buffer);
                paramIndex++;
            }

            // Verificar que hay algo para actualizar
            if (setClauses.length === 0) {
                return res.status(400).json({ error: 'No se proporcionaron datos para actualizar' });
            }

            // Añadir WHERE y RETURNING
            query += setClauses.join(', ') + ` WHERE id_usuario = $${paramIndex} 
                RETURNING id_usuario, nombres, apellido_paterno, apellido_materno, rol, celular, id_programa`;
            values.push(id_usuario);

            const result = await pool.query(query, values);
            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error al actualizar usuario:', error);
            
            let errorMessage = 'Error al actualizar usuario';
            if (error.code === '23503') {
                errorMessage = 'El programa especificado no existe';
            }

            res.status(500).json({ 
                error: errorMessage,
                details: process.env.NODE_ENV === 'development' ? error.message : null
            });
        }
    },

    // Eliminar usuario
    async deleteUser(req, res) {
        try {
            const { id_usuario } = req.params;

            const result = await pool.query(
                'DELETE FROM usuarios WHERE id_usuario = $1 RETURNING id_usuario',
                [id_usuario]
            );

            if (result.rowCount === 0) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            res.json({ 
                message: `Usuario ${result.rows[0].id_usuario} eliminado correctamente` 
            });
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            
            let errorMessage = 'Error al eliminar usuario';
            if (error.code === '23503') {
                errorMessage = 'No se puede eliminar el usuario porque tiene registros asociados';
            }

            res.status(500).json({ 
                error: errorMessage,
                details: process.env.NODE_ENV === 'development' ? error.message : null
            });
        }
    },

    // Obtener usuario actual (autenticado)
    async getCurrentUser(req, res) {
        try {
            const userId = req.user.id_usuario;
            
            const result = await pool.query(`
                SELECT 
                    u.id_usuario, u.nombres, u.apellido_paterno, u.apellido_materno, 
                    u.rol, u.celular, u.id_programa,
                    p.programa AS nombre_programa,
                    f.facultad AS nombre_facultad
                FROM usuarios u
                LEFT JOIN datos_universidad.alm_programas p ON u.id_programa = p.id_programa
                LEFT JOIN datos_universidad.alm_programas_facultades f ON p.id_facultad = f.id_facultad
                WHERE u.id_usuario = $1
            `, [userId]);

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error al obtener usuario actual:', error);
            res.status(500).json({ 
                error: 'Error al obtener usuario actual',
                details: process.env.NODE_ENV === 'development' ? error.message : null
            });
        }
    }
};

module.exports = UserController;