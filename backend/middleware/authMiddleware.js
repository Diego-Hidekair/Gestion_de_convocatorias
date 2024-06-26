// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Acceso denegado' });

    try {
        const verified = jwt.verify(token, 'tu_secreto_jwt');
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ message: 'Token no válido' });
    }
};
const authorizeAdmin = (req, res, next) => {
    if (req.user.Rol !== 'admin') {
        return res.status(403).json({ message: 'Acceso denegado' });
    }
    next();
};

module.exports = { authenticateToken, authorizeAdmin };