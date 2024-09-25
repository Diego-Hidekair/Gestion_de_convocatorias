// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

/*const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization').replace('Bearer ', '');
    if (!token) {
        return res.status(403).json({ error: 'Acceso denegado' });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(403).json({ error: 'Token inválido' });
    }
};*/


const authenticateToken = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No se encontró token, autorización denegada' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        console.log('Token recibido:', token);
        console.log('Rol del usuario:', req.user.rol);
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Token inválido' });
    }
};

const authorizeAdmin = (req, res, next) => {
    console.log("Rol del usuario:", req.user.rol);
    if (req.user.rol !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado: Solo los administradores pueden acceder a esta ruta.' });
    }
    next();
};


module.exports = { authenticateToken, authorizeAdmin};
