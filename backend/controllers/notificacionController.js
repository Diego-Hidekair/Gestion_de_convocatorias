//backend/controllers/notificacionController.js
const NotificacionModel = require('../models/notificacionModel');

const NotificacionController = {
  // Obtener notificaciones del usuario actual
  async obtenerNotificaciones(req, res) {
    try {
      const notificaciones = await NotificacionModel.obtenerPorUsuario(req.user.id_usuario);
      res.json(notificaciones);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Marcar notificación como leída
  async marcarComoLeida(req, res) {
    try {
      const notificacion = await NotificacionModel.marcarLeida(req.params.id);
      if (!notificacion) {
        return res.status(404).json({ error: 'Notificación no encontrada' });
      }
      res.json(notificacion);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Marcar todas como leídas
  async marcarTodasLeidas(req, res) {
    try {
      const notificaciones = await NotificacionModel.marcarTodasLeidas(req.user.id_usuario);
      res.json({ actualizadas: notificaciones.length });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Contar notificaciones no leídas
  async contarNoLeidas(req, res) {
    try {
      const count = await NotificacionModel.contarNoLeidas(req.user.id_usuario);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = NotificacionController;