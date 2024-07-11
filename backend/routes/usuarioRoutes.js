// backend/routes/usuarioRoutes.js
const express = require('express');
const { createUser, getUsers, deleteUser, loginUser } = require('../controllers/usuarioController');
const { authenticateToken, authorizeAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authenticateToken, authorizeAdmin, createUser);
router.get('/', authenticateToken, getUsers);
router.delete('/:id', authenticateToken, authorizeAdmin, deleteUser);
router.post('/login', loginUser);

module.exports = router;
/*const express = require('express');
const { createUser, getUsers, deleteUser, loginUser } = require('../controllers/usuarioController');
const { authenticateToken, authorizeAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/usuarios', authenticateToken, authorizeAdmin, createUser);
router.get('/usuarios', authenticateToken, getUsers);
router.delete('/usuarios/:id', authenticateToken, authorizeAdmin, deleteUser);
router.post('/login', loginUser);

module.exports = router;

*/