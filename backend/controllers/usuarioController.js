// backend/controllers/usuarioController.js
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const getUsuarios = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT usuarios.id_usuario, usuarios.nombres, usuarios.apellido_paterno, usuarios.apellido_materno,
                usuarios.rol, usuarios.celular, alm_programas_facultades.nombre_facultad,
                alm_programas.nombre_carrera, usuarios.foto_perfil
            FROM usuarios
            LEFT JOIN alm_programas_facultades ON usuarios.id_facultad = alm_programas_facultades.id_facultad
            LEFT JOIN alm_programas ON usuarios.id_programa = alm_programas.id_programa;
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ error: 'No se pudo obtener la lista de usuarios.' });
    }
};

const createUser = async (req, res) => {
    const { id_usuario, Nombres, Apellido_paterno, Apellido_materno, Rol, Contraseña, Celular, id_facultad, id_programa } = req.body;
    const foto_perfil = req.file ? req.file.buffer : null;

    try {
        const validRoles = ['admin', 'usuario', 'secretaria', 'decanatura', 'vicerrectorado'];
        if (!validRoles.includes(Rol)) {
            return res.status(400).json({ error: 'El rol especificado no es válido.' });
        }

        const existingUser = await pool.query('SELECT * FROM usuarios WHERE id_usuario = $1', [id_usuario]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'El ID de usuario ya está en uso.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(Contraseña, salt);

        const newUser = await pool.query(
            `INSERT INTO usuarios (id_usuario, nombres, apellido_paterno, apellido_materno, rol, contraseña, celular, id_facultad, id_programa, foto_perfil)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
            [id_usuario, Nombres, Apellido_paterno, Apellido_materno, Rol, hashedPassword, Celular, id_facultad, id_programa, foto_perfil]
        );
        res.status(201).json(newUser.rows[0]);
    } catch (error) {
        console.error('Error al crear el usuario:', error);
        res.status(500).json({ error: 'No se pudo crear el usuario.' });
    }
};

const updateUser = async (req, res) => {
    const { id_usuario } = req.params;
    const { Nombres, Apellido_paterno, Apellido_materno, Rol, Contraseña, Celular, id_facultad, id_programa } = req.body;

    const foto_perfil = req.file ? req.file.buffer : null; 

    try {
        let hashedPassword;

        if (Contraseña) {
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(Contraseña, salt);
        }

        const updatedUser = await pool.query(
            `UPDATE usuarios 
             SET nombres = $1, apellido_paterno = $2, apellido_materno = $3, rol = $4,
                 contraseña = COALESCE($5, contraseña), celular = $6, id_facultad = $7,
                 id_programa = $8, foto_perfil = COALESCE($9, foto_perfil)
             WHERE id_usuario = $10 
             RETURNING id_usuario, nombres, apellido_paterno, apellido_materno, rol, celular, id_facultad, id_programa`,
            [Nombres, Apellido_paterno, Apellido_materno, Rol, hashedPassword, Celular, id_facultad, id_programa, foto_perfil, id_usuario]
        );

        if (updatedUser.rowCount === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json(updatedUser.rows[0]);
    } catch (error) {
        console.error('Error al actualizar el usuario:', error);
        res.status(500).json({ error: 'Error en el servidor al actualizar el usuario.' });
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
                f.nombre_facultad, c.nombre_carrera
            FROM usuarios u
            LEFT JOIN alm_programas_facultades f ON u.id_facultad = f.id_facultad
            LEFT JOIN alm_programas c ON u.id_programa = c.id_programa
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


module.exports = { createUser, getUsuarios, deleteUser, updateUser, getUsuarioById, getCurrentUser };