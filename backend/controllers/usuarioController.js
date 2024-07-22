// backend/controllers/usuarioController.js
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const createUser = async (req, res) => {
    const { id, Nombres, Apellido_paterno, Apellido_materno, Rol, Contraseña, Celular } = req.body;

    if (req.user.rol !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado: Solo los administradores pueden crear usuarios.' });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(Contraseña, salt);

        const newUser = await pool.query(
            'INSERT INTO usuarios (id, Nombres, Apellido_paterno, Apellido_materno, Rol, Contraseña, Celular) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [id, Nombres, Apellido_paterno, Apellido_materno, Rol, hashedPassword, Celular]
        );

        res.json(newUser.rows[0]);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};

const getUsuarios = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM usuarios');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);
        res.json({ message: 'Usuario eliminado' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};

const loginUser = async (req, res) => {
    const { id, Contraseña } = req.body;

    try {
        const user = await pool.query('SELECT * FROM usuarios WHERE id = $1', [id]);

        if (user.rows.length === 0) {
            return res.status(400).json({ message: 'Credenciales incorrectas' });
        }

        const validPassword = await bcrypt.compare(Contraseña, user.rows[0].contraseña);

        if (!validPassword) {
            return res.status(400).json({ message: 'Credenciales incorrectas' });
        }

        const token = jwt.sign({ id: user.rows[0].id, rol: user.rows[0].rol }, process.env.JWT_SECRET, { expiresIn: '4h' });

        res.json({ token });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};

module.exports = { createUser, getUsuarios, deleteUser, loginUser };
