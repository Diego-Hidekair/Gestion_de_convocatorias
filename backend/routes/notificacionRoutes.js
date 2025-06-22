//backend/routes/notificacionRoutes.js
const express = require('express');
const router = express.Router();
const NotificacionController = require('../controllers/notificacionController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken);
router.get('/', NotificacionController.obtenerNotificaciones);
router.patch('/:id/leer', NotificacionController.marcarComoLeida);
router.patch('/marcar-todas-leidas', NotificacionController.marcarTodasLeidas);
router.get('/contar-no-leidas', NotificacionController.contarNoLeidas);

module.exports = router;