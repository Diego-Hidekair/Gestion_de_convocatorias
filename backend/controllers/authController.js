// backend/controllers/authController.js
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// generar token
const generateToken = (user) => {
    return jwt.sign(
        { 
            id_usuario: user.id_usuario, 
            rol: user.rol, 
            id_facultad: user.id_facultad 
        }, 
        process.env.JWT_SECRET,
        { expiresIn: '6h' } 
    );
};

const loginUser = async (req, res) => {
    const { id_usuario, Contraseña } = req.body;

    try {
        const result = await pool.query('SELECT * FROM usuarios WHERE id_usuario = $1', [id_usuario]);
        const user = result.rows[0];

        if (!user) {
            return res.status(400).json({ error: 'Usuario no encontrado' });
        }

        const validPassword = await bcrypt.compare(Contraseña, user.contraseña);
        if (!validPassword) {
            return res.status(400).json({ error: 'Contraseña incorrecta' });
        }
        const token = generateToken(user);

        res.json({ token, userId: user.id_usuario, rol: user.rol });
    } catch (error) {
        console.error('Error al iniciar sesión:', error.message);
        res.status(500).json({ error: 'Error en el servidor al iniciar sesión' });
    }
};
const getMe = async (req, res) => {
    try {
        const userId = req.user.id_usuario;
        const result = await pool.query(
            'SELECT id_usuario, rol, id_facultad FROM usuarios WHERE id_usuario = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener la información del usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = { loginUser, getMe };