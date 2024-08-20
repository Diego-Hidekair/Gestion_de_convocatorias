// backend/controllers/authController.js
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    const { id, Contraseña } = req.body;

    try {
        // Verificar si el usuario existe en la base de datos
        const userResult = await pool.query('SELECT * FROM usuarios WHERE id = $1', [id]);
        const user = userResult.rows[0];

        // Si el usuario no existe, devolver un error
        if (!user) {
            return res.status(401).json({ message: 'Credenciales incorrectas' });
        }

        // Comparar la contraseña ingresada con la almacenada en la base de datos
        const isMatch = await bcrypt.compare(Contraseña, user.contraseña);

        // Si las contraseñas no coinciden, devolver un error
        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales incorrectas' });
        }

        // Generar un token JWT
        const token = jwt.sign({ userId: user.id, role: user.rol }, 'tu_secreto', { expiresIn: '1h' });

        // Devolver el token al cliente
        res.json({ token });
    }  catch (error) {
        // Capturar cualquier error en el servidor y devolver un error 500
        console.error('Error en el login:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

module.exports = { login };
