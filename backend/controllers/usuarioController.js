// backend/controllers/usuarioController.js
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 1
    },fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten imágenes'), false);
        }
    }
}).single('foto_perfil');

const getUsuarios = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id_usuario, nombres, apellido_paterno, apellido_materno, rol, celular
            FROM usuarios
            ORDER BY nombres
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ 
            error: 'Error al obtener usuarios',
            details: error.message  // Agrega esto para más detalles
        });
    }
};
const createUser = async (req, res) => {
    try {
        console.log("Datos recibidos:", req.body);
        console.log("Archivo recibido:", req.file ? "Sí" : "No");

        const { id_usuario, nombres, apellido_paterno, apellido_materno, rol, celular, id_programa, foto_url } = req.body;
        
        // Validaciones básicas
        if (!id_usuario || !nombres || !rol) {
            return res.status(400).json({ error: 'Datos incompletos' });
        }

        if (!req.body.contraseña) {
            return res.status(400).json({ error: 'La contraseña es obligatoria' });
        }

        const validRoles = ['admin', 'personal_administrativo', 'secretaria_de_decanatura', 'tecnico_vicerrectorado', 'vicerrectorado'];
        if (!validRoles.includes(rol)) {
            return res.status(400).json({ error: 'Rol inválido' });
        }

        // Verificar usuario existente
        const existingUser = await pool.query('SELECT * FROM usuarios WHERE id_usuario = $1', [id_usuario]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'El ID de usuario ya está en uso' });
        }

        // Hashear contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.contraseña, salt);
        
        // Manejar imagen (archivo subido o URL)
        let foto_perfil = null;
        if (req.file) {
            foto_perfil = req.file.buffer; // Archivo subido
        } else if (foto_url) {
            foto_perfil = foto_url; // URL de imagen
        }

        // Insertar usuario
        const query = `
            INSERT INTO usuarios (
                id_usuario, nombres, apellido_paterno, apellido_materno, 
                rol, contraseña, celular, id_programa, foto_perfil
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
            RETURNING id_usuario, nombres, apellido_paterno, apellido_materno, rol, celular`;
        
        const values = [
            id_usuario, 
            nombres, 
            apellido_paterno, 
            apellido_materno, 
            rol, 
            hashedPassword,
            celular, 
            id_programa || null, 
            foto_perfil
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
    const { nombres, apellido_paterno, apellido_materno, rol, contraseña, celular, id_programa } = req.body;
    try {
        let hashedPassword;
        let updatedUser;

        if (contraseña) {
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(contraseña, salt);

            updatedUser = await pool.query(
                `UPDATE usuarios SET nombres = $1, apellido_paterno = $2, apellido_materno = $3, rol = $4, contraseña = $5, celular = $6, id_programa = $7 
                WHERE id_usuario = $8 RETURNING id_usuario, nombres, apellido_paterno, apellido_materno, rol, celular, id_programa`,
                [nombres, apellido_paterno, apellido_materno, rol, hashedPassword, celular, id_programa, id_usuario]
            );
        } else {
            updatedUser = await pool.query(
                `UPDATE usuarios SET nombres = $1, apellido_paterno = $2, apellido_materno = $3, rol = $4, celular = $5, id_programa = $6
                WHERE id_usuario = $7 RETURNING id_usuario, nombres, apellido_paterno, apellido_materno, rol, celular, id_programa`,
                [nombres, apellido_paterno, apellido_materno, rol, celular, id_programa, id_usuario]
            );
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

        // Si no se eliminó ningún usuario, envía un error 404
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({ message: 'Usuario eliminado' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Error en el servidor al eliminar el usuario' });
    }
}; 


const getUsuarioById = async (req, res) => {
    const { id_usuario } = req.params;
    try {
        const result = await pool.query('SELECT id_usuario, Nombres, Apellido_paterno, Apellido_materno, Rol, Celular FROM usuarios WHERE id_usuario = $1', [id_usuario]);
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
                p.nombre_carrera
            FROM usuarios u
            LEFT JOIN datos_universidad.alm_programas p ON u.id_programa = p.id_programa
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