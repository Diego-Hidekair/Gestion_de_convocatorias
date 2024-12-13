// backend/controllers/authController.js
const pool = require('../db'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); 

// generar token
const generateToken = (user) => {
    return jwt.sign(
        { 
            id_usuario: user.id_usuario, 
            rol: user.rol,  //rol de usuario
            id_facultad: user.id_facultad 
        }, 
        process.env.JWT_SECRET,
        { expiresIn: '4h' } 
    );
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const user = result.rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(403).json({ error: 'Credenciales incorrectas' });
        }

        const payload = { id: user.id_usuario, rol: user.rol };
        console.log("Payload del token:", payload); // Asegúrate de que id_usuario está en el payload

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token });
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).send('Error al iniciar sesión');
    }
};

module.exports = { loginUser }; 