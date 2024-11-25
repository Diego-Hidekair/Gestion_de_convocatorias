// backend/controllers/usuarioController.js
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const DEFAULT_PROFILE_PICTURE = '//frontend/public/imagenes/avatar.png';

const getUsuarios = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT usuarios.id_usuario, usuarios.nombres, usuarios.apellido_paterno, usuarios.apellido_materno,
                usuarios.rol, usuarios.celular, usuarios.foto_perfil, alm_programas_facultades.Nombre_facultad,
                alm_programas.Nombre_carrera
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
    const { id_usuario, Nombres, Apellido_paterno, Apellido_materno, Rol, Contraseña, Celular, id_facultad, id_programa, foto_perfil} = req.body;
    try {
        const validRoles = ['admin', 'usuario', 'secretaria', 'decanatura', 'vicerrectorado'];
        if (!validRoles.includes(Rol)) {
            return res.status(400).json({ error: 'Rol inválido' });
        }

        const existingUser = await pool.query('SELECT * FROM usuarios WHERE id_usuario = $1', [id_usuario]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'El id ya está en uso' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(Contraseña, salt);

        const userPhoto = foto_perfil || DEFAULT_PROFILE_PICTURE;

        const newUser = await pool.query(
            `INSERT INTO usuarios (id_usuario, Nombres, Apellido_paterno, Apellido_materno, Rol, Contraseña, Celular, id_facultad, id_programa, foto_perfil)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
            [id_usuario, Nombres, Apellido_paterno, Apellido_materno, Rol, hashedPassword, Celular, id_facultad, id_programa, userPhoto]
        );
        res.status(201).json(newUser.rows[0]);
    } catch (error) {
        console.error('Error al crear el usuario:', error);
        res.status(500).json({ error: 'Error en el servidor al crear el usuario', details: error.message });
    }
};

const updateUser = async (req, res) => {
    const { id_usuario } = req.params;
    const { Nombres, Apellido_paterno, Apellido_materno, Rol, Contraseña, Celular, id_facultad, id_programa, foto_perfil } = req.body;

    try {
        const userPhoto = foto_perfil || DEFAULT_PROFILE_PICTURE; // Asigna la foto de perfil predeterminada si no se proporciona.
        let hashedPassword;
        let updatedUser;

        if (Contraseña) {
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(Contraseña, salt);

            updatedUser = await pool.query(
                `UPDATE usuarios SET Nombres = $1, Apellido_paterno = $2, Apellido_materno = $3, Rol = $4, Contraseña = $5, Celular = $6, id_facultad = $7, id_programa = $8, foto_perfil = $9
                 WHERE id_usuario = $10 RETURNING *`,
                [Nombres, Apellido_paterno, Apellido_materno, Rol, hashedPassword, Celular, id_facultad, id_programa, userPhoto, id_usuario]
            );
        } else {
            updatedUser = await pool.query(
                `UPDATE usuarios SET Nombres = $1, Apellido_paterno = $2, Apellido_materno = $3, Rol = $4, Celular = $5, id_facultad = $6, id_programa = $7, foto_perfil = $8
                 WHERE id_usuario = $9 RETURNING *`,
                [Nombres, Apellido_paterno, Apellido_materno, Rol, Celular, id_facultad, id_programa, userPhoto, id_usuario]
            );
        }

        if (updatedUser.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json(updatedUser.rows[0]);
    } catch (error) {
        console.error('Error al actualizar el usuario:', error.message);
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

        res.json({ message: 'Usuario eliminado' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Error en el servidor al eliminar el usuario' });
    }
}; 


const getUsuarioById = async (req, res) => {
    const { id_usuario } = req.params;
    try {
        const result = await pool.query(
            `SELECT id_usuario, Nombres, Apellido_paterno, Apellido_materno, Rol, Celular, foto_perfil 
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
        const result = await pool.query(
            `SELECT u.id_usuario, u.nombres, u.apellido_paterno, u.apellido_materno, u.rol, u.celular, u.foto_perfil,
                f.nombre_facultad, c.nombre_carrera
            FROM usuarios u
            LEFT JOIN alm_programas_facultades f ON u.id_facultad = f.id_facultad
            LEFT JOIN alm_programas c ON u.id_programa = c.id_programa
            WHERE u.id_usuario = $1`,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener el usuario actual:', error);
        res.status(500).json({ error: 'Error en el servidor al obtener el usuario actual' });
    }
};

module.exports = { createUser, getUsuarios, deleteUser, updateUser, getUsuarioById, getCurrentUser };