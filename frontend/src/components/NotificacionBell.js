//frontend/src/components/NotificacionBell.js
import React, { useState, useEffect, useCallback } from 'react';
import { Badge, IconButton, Popover, List, ListItem, ListItemText, Typography, Button, CircularProgress, Divider} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const NotificacionBell = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [nuevas, setNuevas] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Usar useCallback para memoizar la función
  const cargarNotificaciones = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [notifsResponse, countResponse] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/notificaciones`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${process.env.REACT_APP_API_URL}/notificaciones/contar-no-leidas`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      setNotificaciones(notifsResponse.data);
      setNuevas(countResponse.data.count);
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
      if (error.response?.status === 401) {
        // Manejar token expirado
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    cargarNotificaciones();
    const interval = setInterval(cargarNotificaciones, 30000);
    return () => clearInterval(interval);
  }, [cargarNotificaciones]);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const marcarTodasLeidas = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${process.env.REACT_APP_API_URL}/notificaciones/marcar-todas-leidas`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNuevas(0);
      // Actualizar estado local de notificaciones
      setNotificaciones(prev => prev.map(n => ({ ...n, leido: true })));
    } catch (error) {
      console.error('Error al marcar notificaciones:', error);
    }
  };

  const handleNotificacionClick = (notif) => {
    // Marcar como leída al hacer click
    if (!notif.leido) {
      marcarComoLeida(notif.id_notificacion);
    }
    // Navegar a la convocatoria relacionada
    navigate(`/convocatorias/${notif.id_convocatoria}`);
    setAnchorEl(null); // Cerrar popover
  };

  const marcarComoLeida = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${process.env.REACT_APP_API_URL}/notificaciones/${id}/leer`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNuevas(prev => prev > 0 ? prev - 1 : 0);
      // Actualizar estado local
      setNotificaciones(prev => 
        prev.map(n => n.id_notificacion === id ? { ...n, leido: true } : n)
      );
    } catch (error) {
      console.error('Error al marcar notificación:', error);
    }
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleOpen}>
        <Badge badgeContent={nuevas} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <div style={{ width: 350, maxHeight: 400, overflow: 'auto' }}>
          <Typography variant="h6" style={{ padding: '16px 16px 0' }}>
            Notificaciones
            {loading && <CircularProgress size={20} style={{ marginLeft: 10 }} />}
          </Typography>
          
          <Divider style={{ margin: '8px 0' }} />
          
          {notificaciones.length === 0 ? (
            <Typography variant="body2" style={{ padding: 16 }}>
              {loading ? 'Cargando...' : 'No hay notificaciones'}
            </Typography>
          ) : (
            <List dense>
              {notificaciones.map((notif) => (
                <ListItem 
                  key={notif.id_notificacion} 
                  button 
                  divider
                  onClick={() => handleNotificacionClick(notif)}
                  style={{ 
                    backgroundColor: notif.leido ? 'inherit' : '#f0f7ff',
                    alignItems: 'flex-start'
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography 
                        variant="body2" 
                        style={{ fontWeight: notif.leido ? 'normal' : 'bold' }}
                      >
                        {notif.mensaje}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography variant="caption" display="block">
                          {notif.nombre_conv}
                        </Typography>
                        <Typography variant="caption" display="block" color="textSecondary">
                          {new Date(notif.fecha_creacion).toLocaleString()}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
          
          <Divider />
          
          <Button 
            fullWidth 
            onClick={marcarTodasLeidas}
            disabled={nuevas === 0 || loading}
            style={{ marginTop: 8 }}
          >
            Marcar todas como leídas
          </Button>
        </div>
      </Popover>
    </>
  );
};

export default NotificacionBell;