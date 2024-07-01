// backend/controllers/usuarioController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');

// Iniciar sesión de usuario
const loginUser = async (req, res) => {
    const { id, Contraseña } = req.body;

    try {
        const result = await pool.query('SELECT * FROM usuarios WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'Usuario no encontrado' });
        }

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(Contraseña, user.contraseña);
        if (!isMatch) {
            return res.status(400).json({ error: 'Contraseña incorrecta' });
        }

        const token = jwt.sign({ id: user.id, rol: user.rol }, 'tu_secreto_jwt', { expiresIn: '6h' });
        res.json({ token, rol: user.rol });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Crear un nuevo usuario
const createUser = async (req, res) => {
    const { id, Nombres, Apellido_paterno, Apellido_materno, Rol, Contraseña, Celular } = req.body;

    // Verificar que el rol sea uno de los permitidos
    const rolesPermitidos = ['admin', 'usuario', 'secretaria', 'decanatura', 'vicerrectorado'];
    if (!rolesPermitidos.includes(Rol)) {
        return res.status(400).json({ error: 'Rol no permitido' });
    }

    const hashedPassword = await bcrypt.hash(Contraseña, 10);

    try {
        const result = await pool.query(
            'INSERT INTO usuarios (id, Nombres, Apellido_paterno, Apellido_materno, Rol, Contraseña, Celular) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [id, Nombres, Apellido_paterno, Apellido_materno, Rol, hashedPassword, Celular]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// Obtener todos los usuarios
const getUsers = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM usuarios');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Eliminar un usuario
const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);
        res.json({ message: 'Usuario eliminado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    loginUser,
    createUser,
    getUsers,
    deleteUser
};
