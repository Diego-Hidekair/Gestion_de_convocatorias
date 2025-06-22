// frontend/src/services/notificaciones.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const cargarNotificaciones = async () => {
  try {
    const token = localStorage.getItem('token');
    const [notifsResponse, countResponse] = await Promise.all([
      axios.get(`${API_URL}/notificaciones`, { 
        headers: { Authorization: `Bearer ${token}` } 
      }),
      axios.get(`${API_URL}/notificaciones/contar-no-leidas`, { 
        headers: { Authorization: `Bearer ${token}` } 
      })
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