// frontend/src/services/notificaciones.js
import api from '../config/axiosConfig';

export const cargarNotificaciones = async () => {
  try {
    const [notifsResponse, countResponse] = await Promise.all([
      api.get('/notificaciones'),
      api.get('/notificaciones/contar-no-leidas')
    ]);
    
    return {
      notificaciones: notifsResponse.data,
      nuevas: countResponse.data.count
    };
  } catch (error) {
    console.error('Error al cargar notificaciones:', error);
    return { notificaciones: [], nuevas: 0 };
  }
};
