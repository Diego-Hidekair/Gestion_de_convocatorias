// backend/controllers/usuarioController.js
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const getUsuarios = async (req, res) => {
    try {
        const result = await pool.query('SELECT id_usuario, Nombres, Apellido_paterno, Apellido_materno, Rol, Celular FROM usuarios');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Error en el servidor al obtener los usuarios' });
    }
};

const createUser = async (req, res) => {
    const { id_usuario, Nombres, Apellido_paterno, Apellido_materno, Rol, Contraseña, Celular } = req.body;
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
        const newUser = await pool.query(
            'INSERT INTO usuarios (id_usuario, Nombres, Apellido_paterno, Apellido_materno, Rol, Contraseña, Celular) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [id_usuario, Nombres, Apellido_paterno, Apellido_materno, Rol, hashedPassword, Celular]
        );
        res.status(201).json(newUser.rows[0]);
    } catch (error) {
        console.error('Error al crear el usuario:', error);
        res.status(500).json({ error: 'Error en el servidor al crear el usuario', details: error.message });
    }
};

const updateUser = async (req, res) => {
    const { id_usuario } = req.params;
    const { Nombres, Apellido_paterno, Apellido_materno, Rol, Contraseña, Celular } = req.body;

    try {
        let hashedPassword;
        let updatedUser;

        // Si se proporciona una contraseña, hashéala
        if (Contraseña) {
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(Contraseña, salt);

            updatedUser = await pool.query(
                'UPDATE usuarios SET Nombres = $1, Apellido_paterno = $2, Apellido_materno = $3, Rol = $4, Contraseña = $5, Celular = $6 WHERE id_usuario = $7 RETURNING id_usuario, Nombres, Apellido_paterno, Apellido_materno, Rol, Celular',
                [Nombres, Apellido_paterno, Apellido_materno, Rol, hashedPassword, Celular, id_usuario]
            );
        } else {
            updatedUser = await pool.query(
                'UPDATE usuarios SET Nombres = $1, Apellido_paterno = $2, Apellido_materno = $3, Rol = $4, Celular = $5 WHERE id_usuario = $6 RETURNING id_usuario, Nombres, Apellido_paterno, Apellido_materno, Rol, Celular',
                [Nombres, Apellido_paterno, Apellido_materno, Rol, Celular, id_usuario]
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
        const result = await pool.query('SELECT id_usuario, Nombres, Apellido_paterno, Apellido_materno, Rol, Celular FROM usuarios WHERE id_usuario = $1', [userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el usuario actual', error });
    }
};


module.exports = { createUser, getUsuarios, deleteUser, updateUser, getUsuarioById, getCurrentUser };