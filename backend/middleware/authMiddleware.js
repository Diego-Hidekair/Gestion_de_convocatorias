// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, 'tu_secreto_jwt', (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};
const authorizeAdmin = (req, res, next) => {
    if (req.user.Rol !== 'admin') {
        return res.status(403).json({ message: 'Acceso denegado' });
    }
    next();
};

module.exports = { authenticateToken, authorizeAdmin };