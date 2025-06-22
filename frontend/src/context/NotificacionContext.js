// frontend/src/context/NotificacionContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import { cargarNotificaciones } from '../services/notificaciones';

const NotificacionContext = createContext();

export const NotificacionProvider = ({ children }) => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [nuevasNotificaciones, setNuevasNotificaciones] = useState(0);

  const actualizarNotificaciones = async () => {
    try {
      const { notificaciones: notifs, nuevas } = await cargarNotificaciones();
      setNotificaciones(notifs);
      setNuevasNotificaciones(nuevas);
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
    }
  };

  useEffect(() => {
    actualizarNotificaciones();
  }, []);

  return (
    <NotificacionContext.Provider 
      value={{ 
        notificaciones, 
        nuevasNotificaciones,
        actualizarNotificaciones 
      }}
    >
      {children}
    </NotificacionContext.Provider>
  );
};

export const useNotificaciones = () => {
  return useContext(NotificacionContext);
};