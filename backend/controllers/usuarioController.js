// backend/controllers/usuarioController.js
const pool = require('../db'); // Asegúrate de que la conexión a la base de datos esté bien configurada
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const getUsuarios = async (req, res) => {
    try {
        const result = await pool.query('SELECT id, Nombres, Apellido_paterno, Apellido_materno, Rol, Celular FROM usuarios');
        console.log(result.rows); // Verifica la respuesta aquí
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Error en el servidor al obtener los usuarios' });
    }
};

const createUser = async (req, res) => {
    const { id, Nombres, Apellido_paterno, Apellido_materno, Rol, Contraseña, Celular } = req.body;

    try {
        const validRoles = ['admin', 'usuario', 'secretaria', 'decanatura', 'vicerrectorado'];
        if (!validRoles.includes(Rol)) {
            return res.status(400).json({ error: 'Rol inválido' });
        }

        const existingUser = await pool.query('SELECT * FROM usuarios WHERE id = $1', [id]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'El id ya está en uso' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(Contraseña, salt);

        const newUser = await pool.query(
            'INSERT INTO usuarios (id, Nombres, Apellido_paterno, Apellido_materno, Rol, Contraseña, Celular) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [id, Nombres, Apellido_paterno, Apellido_materno, Rol, hashedPassword, Celular]
        );

        res.status(201).json(newUser.rows[0]);
    } catch (error) {
        console.error('Error al crear el usuario:', error);
        res.status(500).json({ error: 'Error en el servidor al crear el usuario', details: error.message });
    }
};

const updateUser = async (req, res) => {
    const { id } = req.params;
    const { Nombres, Apellido_paterno, Apellido_materno, Rol, Contraseña, Celular } = req.body;

    try {
        let hashedPassword;
        let updatedUser;

        if (Contraseña) {
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(Contraseña, salt);

            updatedUser = await pool.query(
                'UPDATE usuarios SET Nombres = $1, Apellido_paterno = $2, Apellido_materno = $3, Rol = $4, Contraseña = $5, Celular = $6 WHERE id = $7 RETURNING id, Nombres, Apellido_paterno, Apellido_materno, Rol, Celular',
                [Nombres, Apellido_paterno, Apellido_materno, Rol, hashedPassword, Celular, id]
            );
        } else {
            updatedUser = await pool.query(
                'UPDATE usuarios SET Nombres = $1, Apellido_paterno = $2, Apellido_materno = $3, Rol = $4, Celular = $5 WHERE id = $6 RETURNING id, Nombres, Apellido_paterno, Apellido_materno, Rol, Celular',
                [Nombres, Apellido_paterno, Apellido_materno, Rol, Celular, id]
            );
        }

        res.json(updatedUser.rows[0]);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Error en el servidor al actualizar el usuario' });
    }
};

const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);
        res.json({ message: 'Usuario eliminado' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Error en el servidor al eliminar el usuario' });
    }
};

// Obtener un usuario por ID
const getUsuarioById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT id, Nombres, Apellido_paterno, Apellido_materno, Rol, Celular FROM usuarios WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Error en el servidor al obtener el usuario' });
    }
};

// Obtener el usuario actual
const getCurrentUser = async (req, res) => {
    const userId = req.user.id; // El ID del usuario lo obtenemos del JWT, no de los params

    try {
        const result = await pool.query('SELECT id, Nombres, Apellido_paterno, Apellido_materno, Rol, Celular FROM usuarios WHERE id = $1', [userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el usuario actual', error });
    }
};

module.exports = { createUser, getUsuarios, deleteUser, updateUser, getUsuarioById, getCurrentUser };
