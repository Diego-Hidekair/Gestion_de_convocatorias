// backend/controllers/authController.js
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generar token
const generateToken = (user) => {
    return jwt.sign(
        { 
            id_usuario: user.id_usuario, 
            rol: user.rol
        }, 
        process.env.JWT_SECRET,
        { expiresIn: '4h' } 
    );
};

const loginUser = async (req, res) => {
    const { id_usuario, contraseña } = req.body;
    if (!id_usuario || !contraseña) {
        return res.status(400).json({ error: 'ID de usuario y contraseña son requeridos' });
    }
    try {
        const result = await pool.query('SELECT * FROM usuarios WHERE id_usuario = $1', [id_usuario]);
        const user = result.rows[0];
        if (!user) {
            return res.status(400).json({ error: 'Credenciales inválidas' }); 
        }

        if (!user.contraseña) {
            return res.status(500).json({ error: 'Error en la configuración del usuario' });
        }
        const validPassword = await bcrypt.compare(contraseña, user.contraseña);
        if (!validPassword) {
            return res.status(400).json({ error: 'Credenciales inválidas' }); 
        }
        const token = generateToken(user);
        res.json({ 
            token, 
            userId: user.id_usuario, 
            rol: user.rol,
            nombres: user.nombres,
            apellido_paterno: user.apellido_paterno
        });
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({ error: 'Error en el servidor al iniciar sesión' });
    }
};

module.exports = { loginUser };