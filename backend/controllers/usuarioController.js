// backend/controllers/usuarioController.js
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

const getUsuarios = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT usuarios.id_usuario, usuarios.nombres, usuarios.apellido_paterno, usuarios.apellido_materno,
                usuarios.rol, usuarios.celular, alm_programas_facultades.nombre_facultad,
                alm_programas.nombre_carrera
            FROM usuarios
            LEFT JOIN alm_programas_facultades ON usuarios.id_facultad = alm_programas_facultades.id_facultad
            LEFT JOIN alm_programas ON usuarios.id_programa = alm_programas.id_programa;
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
};

const createUser = async (req, res) => {
    // Verificar que el formulario multipart se procesó correctamente
    if (!req.is('multipart/form-data')) {
        return res.status(400).json({ error: 'Formato de solicitud incorrecto. Se esperaba multipart/form-data' });
    }

    console.log("Datos recibidos en req.body:", req.body);
    console.log("Archivo recibido:", req.file); // Verifica si el archivo llega

    const passwordField = req.body.Contraseña || req.body.password;
    if (!passwordField) {
        return res.status(400).json({ error: 'La contraseña es obligatoria' });
    }
    
    try {
        const { id_usuario, Nombres, Apellido_paterno, Apellido_materno, Rol, Celular, id_facultad, id_programa } = req.body;
        
        // Validar datos requeridos
        if (!id_usuario || !Nombres || !Rol) {
            return res.status(400).json({ error: 'Datos incompletos' });
        }

        const validRoles = ['admin', 'peronsal_administrativo', 'secretaria_de_decanatura', 'tecnico_vicerrectorado', 'vicerrectorado'];
        if (!validRoles.includes(Rol)) {
            return res.status(400).json({ error: 'Rol inválido' });
        }

        // Verificar si el usuario ya existe
        const existingUser = await pool.query('SELECT * FROM usuarios WHERE id_usuario = $1', [id_usuario]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'El ID de usuario ya está en uso' });
        }

        // Hashear la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(passwordField, salt);
        
        // Procesar la imagen si existe
        let fotoBuffer = null;
        if (req.file) {
            if (req.file.size > 5 * 1024 * 1024) { // 5MB
                return res.status(400).json({ error: 'La imagen es demasiado grande (máximo 5MB)' });
            }
            fotoBuffer = req.file.buffer;
        }

        // Insertar en la base de datos
        const query = `
            INSERT INTO usuarios (
                id_usuario, nombres, apellido_paterno, apellido_materno, 
                rol, contraseña, celular, id_facultad, id_programa, foto_perfil
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
            RETURNING id_usuario, nombres, apellido_paterno, apellido_materno, rol, celular`;
        
        const values = [
            id_usuario, 
            Nombres, 
            Apellido_paterno, 
            Apellido_materno, 
            Rol, 
            hashedPassword,
            Celular, 
            id_facultad || null, 
            id_programa || null, 
            fotoBuffer
        ];
        
        const newUser = await pool.query(query, values);
        res.status(201).json(newUser.rows[0]);
        
    } catch (error) {
        console.error('Error al crear el usuario:', error);
        res.status(500).json({ 
            error: 'Error en el servidor al crear el usuario', 
            details: error.message 
        });
    }
};

const updateUser = async (req, res) => {
    const { id_usuario } = req.params;
    const { Nombres, Apellido_paterno, Apellido_materno, Rol, Contraseña, Celular, id_facultad, id_programa } = req.body;

    try {
        let hashedPassword;
        let updatedUser;

        if (Contraseña) {
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(Contraseña, salt);

            updatedUser = await pool.query(
                `UPDATE usuarios SET nombres = $1, apellido_paterno = $2, apellido_materno = $3, rol = $4, contraseña = $5, celular = $6, id_facultad = $7, id_programa = $8 
                WHERE id_usuario = $9 RETURNING id_usuario, nombres, apellido_paterno, apellido_materno, rol, celular, id_facultad, id_programa`,
                [Nombres, Apellido_paterno, Apellido_materno, Rol, hashedPassword, Celular, id_facultad, id_programa, id_usuario]
            );
        } else {
            updatedUser = await pool.query(
                `UPDATE usuarios SET nombres = $1, apellido_paterno = $2, apellido_materno = $3, rol = $4, celular = $5, id_facultad = $6, id_programa = $7
                WHERE id_usuario = $8 RETURNING id_usuario, nombres, apellido_paterno, apellido_materno, rol, celular, id_facultad, id_programa`,
                [Nombres, Apellido_paterno, Apellido_materno, Rol, Celular, id_facultad, id_programa, id_usuario]
            );
        }

        if (updatedUser.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json(updatedUser.rows[0]);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Error en el servidor al actualizar el usuario' });
    }
};

const deleteUser = async (req, res) => {
    const { id_usuario } = req.params;

    try {
        const result = await pool.query('DELETE FROM usuarios WHERE id_usuario = $1 RETURNING *', [id_usuario]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Error en el servidor al eliminar el usuario' });
    }
}; 

const getUsuarioById = async (req, res) => {
    const { id_usuario } = req.params;
    try {
        const result = await pool.query(`
            SELECT id_usuario, nombres, apellido_paterno, apellido_materno, rol, celular, id_facultad, id_programa 
            FROM usuarios WHERE id_usuario = $1`, 
            [id_usuario]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Error en el servidor al obtener el usuario' });
    }
};

const getCurrentUser = async (req, res) => {
    const userId = req.user.id_usuario;
    try {
        const result = await pool.query(`
            SELECT u.id_usuario, u.nombres, u.apellido_paterno, u.apellido_materno, u.rol, u.celular,
                f.nombre_facultad, p.nombre_carrera
            FROM usuarios u
            LEFT JOIN alm_programas_facultades f ON u.id_facultad = f.id_facultad
            LEFT JOIN alm_programas p ON u.id_programa = p.id_programa
            WHERE u.id_usuario = $1
        `, [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener el perfil del usuario:', error);
        res.status(500).json({ message: 'Error al obtener el usuario actual', error });
    }
};

module.exports = { createUser, getUsuarios, deleteUser, updateUser, getUsuarioById, getCurrentUser, upload} ;