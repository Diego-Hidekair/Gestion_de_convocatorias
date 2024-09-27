// backend/controllers/authController.js
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Función para generar el token JWT con el rol incluido
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, rol: user.rol }, // Incluimos el rol en el token
        process.env.JWT_SECRET,
        { expiresIn: '4h' } // Expira en 4 horas
    );
};

const loginUser = async (req, res) => {
    const { id, Contraseña } = req.body;

    try {
        const result = await pool.query('SELECT * FROM usuarios WHERE id = $1', [id]);
        const user = result.rows[0];

        if (!user) {
            return res.status(400).json({ error: 'Usuario no encontrado' });
        }

        const validPassword = await bcrypt.compare(Contraseña, user.contraseña);
        if (!validPassword) {
            return res.status(400).json({ error: 'Contraseña incorrecta' });
        }

        // Genera el token
        const token = generateToken(user);

        res.json({ token, userId: user.id, rol: user.rol }); // Incluimos el rol en la respuesta
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Error en el servidor al iniciar sesión' });
    }
};

module.exports = { loginUser };