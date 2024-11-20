// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

// Middleware para autenticar el token JWT
const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token no proporcionado' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Token no válido' });

        console.log("Payload del token:", user);  
        req.user = user; 
        next(); 
    });
    
};

// Middleware para verificar roles dinámicamente
const authorizeRole = (rolesPermitidos) => (req, res, next) => {
    const { rol } = req.user;
    if (!rolesPermitidos.includes(rol)) {
        return res.status(403).json({ error: `Acceso denegado: Solo los roles permitidos (${rolesPermitidos.join(', ')}) pueden acceder a esta ruta.` });
    }
    next();
};

/*// Middleware para verificar que el usuario es administrador
const authorizeAdmin = (req, res, next) => {
    console.log("Rol del usuario:", req.user.rol);  
    if (req.user.rol !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado: Solo los administradores pueden acceder a esta ruta.' });
    }
    next();  
};

// Middleware para verificar que el usuario tiene rol de "secretaria"
const verificarRolSecretaria = (req, res, next) => {
    if (req.user.rol !== 'secretaria') {
        return res.status(403).json({ error: 'Acceso denegado: rol no autorizado' });
    }
    next();
};
*/

module.exports = { authenticateToken, authorizeRole };
//module.exports = { authenticateToken, authorizeAdmin, verificarRolSecretaria,authorizeRole };