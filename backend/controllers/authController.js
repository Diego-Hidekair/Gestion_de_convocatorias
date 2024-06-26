// backend/controllers/authController.js
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    const { id, Contraseña } = req.body;

    try {
        const userResult = await pool.query('SELECT * FROM usuarios WHERE id = $1', [id]);
        const user = userResult.rows[0];

        if (!user) {
            return res.status(401).json({ message: 'Credenciales incorrectas' });
        }

        const isMatch = await bcrypt.compare(Contraseña, user.contraseña);

        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales incorrectas' });
        }

        const token = jwt.sign({ userId: user.id, role: user.rol }, 'tu_secreto', { expiresIn: '1h' });

        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

module.exports = { login };
