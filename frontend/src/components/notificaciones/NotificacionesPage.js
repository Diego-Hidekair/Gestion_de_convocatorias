// frontend/src/components/notificaciones/NotificacionesPage.js
import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, List, ListItem, ListItemText, Divider, Chip, Button, ToggleButton, ToggleButtonGroup,IconButton} from '@mui/material';
import { Notifications as NotificationsIcon, NotificationsOff as NotificationsOffIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const NotificacionesPage = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchNotificaciones = async () => {
    try {
      const response = await axios.get('/notificaciones');
      setNotificaciones(response.data);
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.patch(`/notificaciones/${id}/leer`);
      setNotificaciones(notificaciones.map(n => 
        n.id_notificacion === id ? {...n, leido: true} : n
      ));
    } catch (error) {
      console.error('Error al marcar como leída:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch('/notificaciones/marcar-todas-leidas');
      setNotificaciones(notificaciones.map(n => ({...n, leido: true})));
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await axios.delete(`/notificaciones/${id}`);
      setNotificaciones(notificaciones.filter(n => n.id_notificacion !== id));
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
    }
  };

  const filteredNotificaciones = notificaciones.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.leido;
    return true;
  });

  useEffect(() => {
    fetchNotificaciones();
  }, []);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          <NotificationsIcon sx={{ verticalAlign: 'middle', mr: 2 }} />
          Mis Notificaciones
        </Typography>
        
        <Box>
          <ToggleButtonGroup
            value={filter}
            exclusive
            onChange={(e, newFilter) => setFilter(newFilter)}
            size="small"
            sx={{ mr: 2 }}
          >
            <ToggleButton value="all" aria-label="todas">
              Todas
            </ToggleButton>
            <ToggleButton value="unread" aria-label="no leídas">
              No leídas
            </ToggleButton>
          </ToggleButtonGroup>
          
          <Button 
            variant="outlined" 
            onClick={markAllAsRead}
            disabled={notificaciones.every(n => n.leido)}
            startIcon={<NotificationsOffIcon />}
          >
            Marcar todas como leídas
          </Button>
        </Box>
      </Box>

      <List sx={{ bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
        {loading ? (
          <ListItem>
            <ListItemText primary="Cargando notificaciones..." />
          </ListItem>
        ) : filteredNotificaciones.length === 0 ? (
          <ListItem>
            <ListItemText primary={`No hay notificaciones ${filter === 'unread' ? 'no leídas' : ''}`} />
          </ListItem>
        ) : (
          filteredNotificaciones.map((notificacion) => (
            <React.Fragment key={notificacion.id_notificacion}>
              <ListItem 
                alignItems="flex-start"
                secondaryAction={
                  <IconButton 
                    edge="end" 
                    aria-label="eliminar"
                    onClick={() => deleteNotification(notificacion.id_notificacion)}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography
                        component="span"
                        variant="body1"
                        sx={{ 
                          fontWeight: !notificacion.leido ? 'bold' : 'normal',
                          mr: 2
                        }}
                      >
                        {notificacion.mensaje}
                      </Typography>
                      {!notificacion.leido && (
                        <Chip 
                          label="Nuevo" 
                          size="small" 
                          color="primary"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Box>
                  }
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
                      {format(new Date(notificacion.fecha_creacion), 'PPPp', { locale: es })}
                    </>
                  }
                  secondaryTypographyProps={{ component: 'div' }}
                  onClick={() => markAsRead(notificacion.id_notificacion)}
                  sx={{ cursor: 'pointer' }}
                />
              </ListItem>
              <Divider variant="inset" component="li" />
            </React.Fragment>
          ))
        )}
      </List>
    </Container>
  );
};

export default NotificacionesPage;