// backend/routes/usuarioRoutes.js
// routes/usuarioRoutes.js
const express = require('express');
const router = express.Router();
const { createUser, getUsers, deleteUser, loginUser } = require('../controllers/usuarioController');
const { authenticateToken, authorizeAdmin } = require('../middleware/authMiddleware');

router.post('/login', loginUser);
router.post('/', authenticateToken, authorizeAdmin, createUser);
router.get('/', authenticateToken, authorizeAdmin, getUsers);
router.delete('/:id', authenticateToken, authorizeAdmin, deleteUser);

module.exports = router;
/*const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { authenticateToken, authorizeAdmin } = require('../middleware/authMiddleware');

router.post('/login', usuarioController.loginUser);
router.post('/', authenticateToken, authorizeAdmin, usuarioController.createUser);
router.get('/', authenticateToken, authorizeAdmin, usuarioController.getUsers);
router.delete('/:id', authenticateToken, authorizeAdmin, usuarioController.deleteUser);

module.exports = router;*/
