// src/components/TipoconvocatoriaList.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/axiosConfig';  
import {Box, Typography, Button, Grid, Card, CardContent, Container, useTheme, Paper, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, IconButton, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';

const TipoconvocatoriaList = ({ isOpen }) => {
  const [tiposConvocatoria, setTiposConvocatoria] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tipoToDelete, setTipoToDelete] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const theme = useTheme();
  const navigate = useNavigate();

  const fetchTiposConvocatoria = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tipos-convocatorias');
      setTiposConvocatoria(response.data);
      setError(null);
    } catch (error) {
      console.error('Error al obtener los tipos de convocatoria:', error);
      setError('Error al cargar los tipos de convocatoria');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTiposConvocatoria();
  }, []);

  const handleDeleteClick = (id) => {
    setTipoToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/tipos-convocatorias/${tipoToDelete}`);
      setTiposConvocatoria(tiposConvocatoria.filter(tipo => tipo.id_tipoconvocatoria !== tipoToDelete));
      setSnackbarMessage('Tipo de convocatoria eliminado exitosamente');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error al eliminar el tipo de convocatoria:', error);
      setError('Error al eliminar el tipo de convocatoria');
    } finally {
      setDeleteDialogOpen(false);
      setTipoToDelete(null);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box m={2}>
        <Alert 
          severity="error"
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={fetchTiposConvocatoria}
              startIcon={<RefreshIcon />}
            >
              Reintentar
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        ml: isOpen ? '240px' : '0px',
        transition: theme.transitions.create('margin', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        p: 3,
        width: isOpen ? 'calc(100% - 240px)' : '100%'
      }}
    >
      <Paper elevation={3} sx={{ p: 3, mb: 3, backgroundColor: theme.palette.primary.main }}>
        <Typography variant="h4" component="h1" sx={{ color: 'white', textAlign: 'center' }}>
          Lista de Tipos de Convocatoria
        </Typography>
      </Paper>

      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/tipos-convocatorias/crear')}
          >
            Nuevo Tipo
          </Button>
          
          <Tooltip title="Actualizar lista">
            <IconButton onClick={fetchTiposConvocatoria}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {tiposConvocatoria.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6">No hay tipos de convocatoria registrados</Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate('/tipos-convocatorias/crear')}
              sx={{ mt: 2 }}
            >
              Crear Nuevo Tipo
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {tiposConvocatoria.map((tipo) => (
              <Grid item xs={12} sm={6} md={4} key={tipo.id_tipoconvocatoria}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="h2" textAlign="center">
                      {tipo.nombre_convocatoria}
                    </Typography>
                    {tipo.Titulo && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {tipo.Titulo.length > 100 
                          ? `${tipo.Titulo.substring(0, 100)}...` 
                          : tipo.Titulo}
                      </Typography>
                    )}
                  </CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-around', p: 1 }}>
                    <Button
                      variant="contained"
                      color="warning"
                      startIcon={<EditIcon />}
                      onClick={() => navigate(`/tipos-convocatorias/editar/${tipo.id_tipoconvocatoria}`)}
                      size="small"
                    >
                      Editar
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDeleteClick(tipo.id_tipoconvocatoria)}
                      size="small"
                    >
                      Eliminar
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* Diálogo de confirmación para eliminar */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          ¿Está seguro que desea eliminar este tipo de convocatoria? Esta acción no se puede deshacer.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleDeleteConfirm} color="error">Eliminar</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para mensajes */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default TipoconvocatoriaList;
