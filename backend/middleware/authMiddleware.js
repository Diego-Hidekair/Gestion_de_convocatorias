// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const pool = require('../db');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        console.error('Token no proporcionado');
        return res.status(401).json({ error: 'Acceso denegado: Token no proporcionado.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            console.error('Token inválido:', err);
            return res.status(403).json({ error: 'Acceso denegado: Token inválido o expirado.' });
        }
        try {
            console.log('Token decodificado:', decoded);
            const userId = decoded.id_usuario || decoded.id;
            const user = await pool.query(
                'SELECT id_usuario, rol, id_programa FROM usuarios WHERE id_usuario = $1', 
                [userId]
            );
            if (user.rows.length === 0) {
                console.error('Usuario no encontrado en BD con ID:', userId);
                return res.status(403).json({ error: 'Usuario no encontrado' });
            }
            req.user = {
                id: user.rows[0].id_usuario,
                rol: user.rows[0].rol,
                id_programa: user.rows[0].id_programa ? user.rows[0].id_programa.trim() : null 
            };
            console.log('Usuario autenticado:', req.user);
            next();
        } catch (error) {
            console.error('Error al verificar usuario:', error);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
    });
};

const authorizeAdmin = (req, res, next) => {
    const adminRoles = ['admin', 'vicerrectorado', 'tecnico_vicerrectorado'];
    if (!adminRoles.includes(req.user.rol)) {
        return res.status(403).json({ error: 'Acceso denegado: No tienes permisos de administración.' });
    }
    next();
};

const verificarRolSecretaria = (req, res, next) => {
    if (req.user.rol !== 'secretaria_de_decanatura') {
        return res.status(403).json({ error: 'Acceso denegado: Solo secretaría de decanatura puede acceder.' });
    }
    next();
};

const authorizeRoles = (permittedRoles) => {
    return (req, res, next) => {
        if (!permittedRoles.includes(req.user.rol)) {
            return res.status(403).json({ error: 'Acceso denegado: No tienes el rol necesario para acceder a esta ruta.' });
        }
        next();
    };
};

function verificarRol(...rolesPermitidos) {
    return (req, res, next) => {
        if (!rolesPermitidos.includes(req.user.rol)) {
            return res.status(403).json({ message: 'No tienes permisos para realizar esta acción.' });
        }
        next();
    };
}
const verificarRolVicerrectorado = (req, res, next) => {
    if (req.user.rol !== 'vicerrectorado' && req.user.rol !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado: Solo el Vicerrectorado puede acceder.' });
    }
    next();
};

module.exports = { authenticateToken, authorizeAdmin, verificarRolSecretaria, verificarRolVicerrectorado, authorizeRoles, verificarRol };