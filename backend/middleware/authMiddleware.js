// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Acceso denegado: Token no proporcionado.' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Acceso denegado: Token inválido o expirado.' });
        req.user = user;
        next();
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

module.exports = { authenticateToken, authorizeAdmin, verificarRolSecretaria, authorizeRoles, verificarRol };