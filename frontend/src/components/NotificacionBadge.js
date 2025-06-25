// frontend/src/components/NotificacionBadge.js
import React, { useState, useEffect } from 'react';
import { Badge, IconButton, Popover, List, ListItem, ListItemText, Typography, Box, Divider, Button } from '@mui/material';
import { Notifications as NotificationsIcon } from '@mui/icons-material';
import api from '../config/axiosConfig'; 
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const NotificacionBadge = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificaciones, setNotificaciones] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    markAllAsRead();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const fetchNotificaciones = async () => {
    try {
      const response = await api.get('/notificaciones');
      setNotificaciones(response.data);
      setUnreadCount(response.data.filter(n => !n.leido).length);
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notificaciones/${id}/leer`);
      setNotificaciones(notificaciones.map(n => 
        n.id_notificacion === id ? {...n, leido: true} : n
      ));
      setUnreadCount(prev => prev - 1);
    } catch (error) {
      console.error('Error al marcar como leída:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notificaciones/marcar-todas-leidas');
      setNotificaciones(notificaciones.map(n => ({...n, leido: true})));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error);
    }
  };

  useEffect(() => {
    fetchNotificaciones();
    
    // Actualizar cada 5 minutos
    const interval = setInterval(fetchNotificaciones, 300000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <IconButton 
        color="inherit" 
        onClick={handleClick}
        aria-label="notificaciones"
        aria-controls="notificaciones-popover"
        aria-haspopup="true"
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Popover
        id="notificaciones-popover"
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          style: { width: '400px', maxHeight: '500px' }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Notificaciones
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {unreadCount} sin leer
            </Typography>
            <Button 
              size="small" 
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              Marcar todas como leídas
            </Button>
          </Box>
        </Box>
        
        <Divider />
        
        <List sx={{ overflow: 'auto' }}>
          {loading ? (
            <ListItem>
              <ListItemText primary="Cargando notificaciones..." />
            </ListItem>
          ) : notificaciones.length === 0 ? (
            <ListItem>
              <ListItemText primary="No hay notificaciones" />
            </ListItem>
          ) : (
            notificaciones.map((notificacion) => (
              <React.Fragment key={notificacion.id_notificacion}>
                <ListItem 
                  alignItems="flex-start"
                  sx={{
                    backgroundColor: !notificacion.leido ? 'action.hover' : 'inherit',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'action.selected'
                    }
                  }}
                  onClick={() => {
                    markAsRead(notificacion.id_notificacion);
                    // Aquí puedes agregar navegación a la convocatoria relacionada
                  }}
                >
                  <ListItemText
                    primary={notificacion.mensaje}
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                          display="block"
                        >
                          {notificacion.nombre_conv}
                        </Typography>
                        {formatDistanceToNow(new Date(notificacion.fecha_creacion), {
                          addSuffix: true,
                          locale: es
                        })}
                      </>
                    }
                    secondaryTypographyProps={{ component: 'div' }}
                  />
                  {!notificacion.leido && (
                    <Box 
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        ml: 1
                      }}
                    />
                  )}
                </ListItem>
                <Divider variant="inset" component="li" />
              </React.Fragment>
            ))
          )}
        </List>
      </Popover>
    </>
  );
};

export default NotificacionBadge;