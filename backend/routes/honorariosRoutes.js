// backend/routes/honorariosRoutes.js
const express = require('express');
const router = express.Router();
const honorariosController = require('../controllers/honorariosController');
const { authenticateToken, authorizeAdmin, verificarRolSecretaria } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, honorariosController.getHonorarios); // acceso tanto para admin como secretaria
router.get('/:id', authenticateToken, honorariosController.getHonorarioById); // acceso tanto para admin como secretaria
router.post('/', authenticateToken, verificarRolSecretaria, honorariosController.crearHonorario); // solo para admin y secretaria
router.put('/:id', authenticateToken, verificarRolSecretaria, honorariosController.updateHonorario); // solo para admin y secretaria
router.delete('/:id', authenticateToken, authorizeAdmin, honorariosController.deleteHonorario); // solo para admin

module.exports = router;

