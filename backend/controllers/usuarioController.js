// backend/controllers/usuarioController.js

const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const createUser = async (req, res) => {
    const { id, nombres, apellidoPaterno, apellidoMaterno, rol, contraseña, celular } = req.body;

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(contraseña, salt);

        const newUser = await pool.query(
            'INSERT INTO usuarios (id, Nombres, Apellido_paterno, Apellido_materno, Rol, Contraseña, Celular) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [id, nombres, apellidoPaterno, apellidoMaterno, rol, hashedPassword, celular]
        );

        res.json(newUser.rows[0]);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Error en el servidor al crear el usuario' });
    }
};

const getUsuarios = async (req, res) => {
    try {
        const result = await pool.query('SELECT id, Nombres, Apellido_paterno, Apellido_materno, Rol, Celular FROM usuarios');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Error en el servidor al obtener los usuarios' });
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

const loginUser = async (req, res) => {
    const { id, contraseña } = req.body;

    try {
        const user = await pool.query('SELECT * FROM usuarios WHERE id = $1', [id]);

        if (user.rows.length === 0) {
            return res.status(400).json({ error: 'Credenciales incorrectas' });
        }

        const validPassword = await bcrypt.compare(contraseña, user.rows[0].contraseña);

        if (!validPassword) {
            return res.status(400).json({ error: 'Credenciales incorrectas' });
        }

        const token = jwt.sign(
            { id: user.rows[0].id, rol: user.rows[0].rol },
            process.env.JWT_SECRET,
            { expiresIn: '4h' }
        );

        console.log('Token generado:', token);
        console.log('Rol del usuario:', user.rows[0].rol);

        res.json({ token });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Error en el servidor al iniciar sesión' });
    }
};
const updateUser = async (req, res) => {
    const { id } = req.params;
    const { nombres, apellidoPaterno, apellidoMaterno, rol, celular } = req.body;

    try {
        const updatedUser = await pool.query(
            'UPDATE usuarios SET Nombres = $1, Apellido_paterno = $2, Apellido_materno = $3, Rol = $4, Celular = $5 WHERE id = $6 RETURNING id, Nombres, Apellido_paterno, Apellido_materno, Rol, Celular',
            [nombres, apellidoPaterno, apellidoMaterno, rol, celular, id]
        );

        res.json(updatedUser.rows[0]);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Error en el servidor al actualizar el usuario' });
    }
};

module.exports = { createUser, getUsuarios, deleteUser, loginUser, updateUser };
