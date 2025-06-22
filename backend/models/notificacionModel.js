//backend/models/notificacionModel.js
const pool = require('../db');

const NotificacionModel = {
  async crear(notificacion) {
    const { id_convocatoria, id_usuario, mensaje, tipo } = notificacion;
    const query = `
      INSERT INTO notificaciones (id_convocatoria, id_usuario, mensaje, tipo)
      VALUES ($1, $2, $3, $4)
      RETURNING *`;
    const values = [id_convocatoria, id_usuario, mensaje, tipo];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async obtenerPorUsuario(id_usuario) {
    const query = `
      SELECT n.*, c.nombre_conv, c.estado as estado_convocatoria
      FROM notificaciones n
      JOIN convocatorias c ON n.id_convocatoria = c.id_convocatoria
      WHERE n.id_usuario = $1
      ORDER BY n.fecha_creacion DESC`;
    const result = await pool.query(query, [id_usuario]);
    return result.rows;
  },

  async marcarLeida(id_notificacion) {
    const query = `
      UPDATE notificaciones 
      SET leido = TRUE 
      WHERE id_notificacion = $1
      RETURNING *`;
    const result = await pool.query(query, [id_notificacion]);
    return result.rows[0];
  },

  async marcarTodasLeidas(id_usuario) {
    const query = `
      UPDATE notificaciones 
      SET leido = TRUE 
      WHERE id_usuario = $1 AND leido = FALSE
      RETURNING *`;
    const result = await pool.query(query, [id_usuario]);
    return result.rows;
  },

  async contarNoLeidas(id_usuario) {
    const query = `
      SELECT COUNT(*) 
      FROM notificaciones 
      WHERE id_usuario = $1 AND leido = FALSE`;
    const result = await pool.query(query, [id_usuario]);
    return parseInt(result.rows[0].count);
  }
};

module.exports = NotificacionModel;