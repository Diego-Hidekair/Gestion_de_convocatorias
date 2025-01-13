// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {// autenticar el ingreso 
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Acceso denegado: Token no proporcionado.' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Acceso denegado: Token inválido o expirado.' });
        console.log('Token decodificado:', user);
        req.user = user;
        next();
    });
};

// Middleware para verificar que el usuario es administrador
const authorizeAdmin = (req, res, next) => {
    console.log('Rol del usuario:', req.user.rol);
    if (req.user.rol !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado: Solo los administradores pueden acceder a esta ruta.' });
    }
    next();
};

// Middleware para verificar que el usuario tiene rol de "secretaria"
const verificarRolSecretaria = (req, res, next) => {
    if (req.user.rol !== 'secretaria') {
        return res.status(403).json({ error: 'Acceso denegado: Rol no autorizado.' });
    }
    next();
};

const authorizeRoles = (permittedRoles) => {//verificacion del rol de usuario
    return (req, res, next) => {
        if (!permittedRoles.includes(req.user.rol)) {
            return res.status(403).json({ error: 'Acceso denegado: No tienes el rol necesario para acceder a esta ruta.' });
        }
        next();
    };
};

function verificarRol(...rolesPermitidos) {
    return (req, res, next) => {
        const { rol } = req.user;
        if (!rolesPermitidos.includes(rol)) {
            return res.status(403).json({ message: 'No tienes permisos para realizar esta acción.' });
        }
        next();
    };
}

module.exports = { authenticateToken, authorizeAdmin, verificarRolSecretaria, authorizeRoles, verificarRol  };