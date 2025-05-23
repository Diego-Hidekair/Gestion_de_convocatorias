// frontend/src/components/convocatorias/ConvocatoriaList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, MenuItem, FormControl, InputLabel, Select, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions, Alert, Snackbar, Chip, Badge, Tooltip} from '@mui/material';
import { Edit, Delete, Visibility, Download, Comment, Add, Search, Refresh } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const ConvocatoriaList = () => {
  const navigate = useNavigate();
  const [convocatorias, setConvocatorias] = useState([]);
  const [filteredConvocatorias, setFilteredConvocatorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('nombre_conv');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [convocatoriaToDelete, setConvocatoriaToDelete] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [userRole, setUserRole] = useState('');

  // Estados para manejar cambios de estado
  const [estadoDialogOpen, setEstadoDialogOpen] = useState(false);
  const [selectedEstado, setSelectedEstado] = useState('');
  const [selectedConvocatoria, setSelectedConvocatoria] = useState(null);
  const [comentario, setComentario] = useState('');

  // Campos de búsqueda disponibles
  const searchFields = [
    { value: 'nombre_conv', label: 'Nombre' },
    { value: 'nombre_programa', label: 'Programa' },
    { value: 'nombre_facultad', label: 'Facultad' },
    { value: 'estado', label: 'Estado' }
  ];

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/usuarios/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserRole(response.data.rol);
      } catch (error) {
        console.error('Error al obtener el rol del usuario:', error);
      }
    };

    fetchUserRole();
    fetchConvocatorias();
  }, []);

  const fetchConvocatorias = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/convocatorias');
      setConvocatorias(response.data);
      setFilteredConvocatorias(response.data);
      setError(null);
    } catch (error) {
      console.error('Error al obtener convocatorias:', error);
      setError(error.response?.data?.error || 'Error al cargar convocatorias');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredConvocatorias(convocatorias);
    } else {
      const filtered = convocatorias.filter(conv => 
        String(conv[searchField]).toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredConvocatorias(filtered);
    }
  }, [searchTerm, searchField, convocatorias]);

  const handleDeleteClick = (id) => {
    setConvocatoriaToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`http://localhost:5000/convocatorias/${convocatoriaToDelete}`);
      setConvocatorias(convocatorias.filter(c => c.id_convocatoria !== convocatoriaToDelete));
      showSnackbar('Convocatoria eliminada correctamente', 'success');
    } catch (error) {
      console.error('Error al eliminar convocatoria:', error);
      showSnackbar('Error al eliminar convocatoria', 'error');
    } finally {
      setDeleteDialogOpen(false);
      setConvocatoriaToDelete(null);
    }
  };

  const handleEstadoChangeClick = (convocatoria, nuevoEstado) => {
    setSelectedConvocatoria(convocatoria);
    setSelectedEstado(nuevoEstado);
    
    if (['Observado', 'Devuelto'].includes(nuevoEstado)) {
      setEstadoDialogOpen(true);
    } else {
      confirmEstadoChange(nuevoEstado);
    }
  };

  const confirmEstadoChange = async (comentario = null) => {
    try {
      const payload = { estado: selectedEstado };
      if (comentario) payload.comentario_observado = comentario;
      
      await axios.patch(
        `http://localhost:5000/convocatorias/${selectedConvocatoria.id_convocatoria}/estado`,
        payload
      );
      
      // Actualizar el estado localmente
      const updatedConvocatorias = convocatorias.map(conv => 
        conv.id_convocatoria === selectedConvocatoria.id_convocatoria 
          ? { 
              ...conv, 
              estado: selectedEstado,
              ...(comentario ? { comentario_observado: comentario } : {}) 
            } 
          : conv
      );
      
      setConvocatorias(updatedConvocatorias);
      showSnackbar('Estado actualizado correctamente', 'success');
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      showSnackbar('Error al cambiar estado', 'error');
    } finally {
      setEstadoDialogOpen(false);
      setSelectedConvocatoria(null);
      setSelectedEstado('');
      setComentario('');
    }
  };

  const handleEditComentario = (convocatoria) => {
    setSelectedConvocatoria(convocatoria);
    setComentario(convocatoria.comentario_observado || '');
    setSelectedEstado('EDIT_COMENTARIO');
    setEstadoDialogOpen(true);
  };

  const handleDownloadPdf = async (id) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/pdf/download/${id}`,
        { responseType: 'blob' }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `convocatoria_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      
      showSnackbar('Descarga iniciada', 'success');
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      showSnackbar('Error al descargar PDF', 'error');
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Para Revisión': return 'default';
      case 'En Revisión': return 'info';
      case 'Observado': return 'warning';
      case 'Revisado': return 'primary';
      case 'Aprobado': return 'success';
      case 'Devuelto': return 'error';
      case 'Para Publicar': return 'secondary';
      default: return 'default';
    }
  };

  const renderEstadoActions = (convocatoria) => {
    if (userRole === 'tecnico_vicerrectorado') {
      switch (convocatoria.estado) {
        case 'Para Revisión':
          return (
            <Button 
              size="small" 
              color="info" 
              onClick={() => handleEstadoChangeClick(convocatoria, 'En Revisión')}
            >
              Marcar en Revisión
            </Button>
          );
        case 'En Revisión':
          return (
            <>
              <Button 
                size="small" 
                color="success" 
                onClick={() => handleEstadoChangeClick(convocatoria, 'Revisado')}
                sx={{ mr: 1 }}
              >
                Revisado
              </Button>
              <Button 
                size="small" 
                color="warning" 
                onClick={() => handleEstadoChangeClick(convocatoria, 'Observado')}
              >
                Observar
              </Button>
            </>
          );
        default:
          return null;
      }
    } else if (userRole === 'vicerrectorado') {
      if (convocatoria.estado === 'Revisado') {
        return (
          <>
            <Button 
              size="small" 
              color="success" 
              onClick={() => handleEstadoChangeClick(convocatoria, 'Aprobado')}
              sx={{ mr: 1 }}
            >
              Aprobar
            </Button>
            <Button 
              size="small" 
              color="error" 
              onClick={() => handleEstadoChangeClick(convocatoria, 'Devuelto')}
            >
              Devolver
            </Button>
          </>
        );
      } else if (convocatoria.estado === 'Aprobado') {
        return (
          <Button 
            size="small" 
            color="secondary" 
            onClick={() => handleEstadoChangeClick(convocatoria, 'Para Publicar')}
          >
            Marcar para Publicar
          </Button>
        );
      }
    }
    return null;
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Lista de Convocatorias
      </Typography>
      
      {/* Barra de búsqueda y acciones */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="Buscar"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search color="action" sx={{ mr: 1 }} />,
            }}
          />
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Buscar por</InputLabel>
            <Select
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
              label="Buscar por"
            >
              {searchFields.map((field) => (
                <MenuItem key={field.value} value={field.value}>
                  {field.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        
        <Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/convocatorias/new')}
            sx={{ mr: 2 }}
          >
            Nueva Convocatoria
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchConvocatorias}
          >
            Actualizar
          </Button>
        </Box>
      </Box>
      
      {/* Tabla de convocatorias */}
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Programa</TableCell>
              <TableCell>Facultad</TableCell>
              <TableCell>Fecha Inicio</TableCell>
              <TableCell>Fecha Fin</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ color: 'error.main' }}>
                  {error}
                </TableCell>
              </TableRow>
            ) : filteredConvocatorias.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No se encontraron convocatorias
                </TableCell>
              </TableRow>
            ) : (
              filteredConvocatorias.map((convocatoria) => (
                <TableRow key={convocatoria.id_convocatoria}>
                  <TableCell>{convocatoria.nombre_conv}</TableCell>
                  <TableCell>{convocatoria.nombre_programa}</TableCell>
                  <TableCell>{convocatoria.nombre_facultad}</TableCell>
                  <TableCell>
                    {format(new Date(convocatoria.fecha_inicio), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>
                    {convocatoria.fecha_fin ? format(new Date(convocatoria.fecha_fin), 'dd/MM/yyyy') : 'N/A'}
                  </TableCell>
                  
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip 
                        label={convocatoria.estado} 
                        color={getEstadoColor(convocatoria.estado)} 
                        size="small"
                      />
                      
                      {convocatoria.comentario_observado && (
                        <Tooltip title="Ver comentario">
                          <IconButton 
                            size="small" 
                            onClick={() => handleEditComentario(convocatoria)}
                          >
                            <Badge color="error" variant="dot">
                              <Comment fontSize="small" />
                            </Badge>
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                    
                    <Box sx={{ mt: 1 }}>
                      {renderEstadoActions(convocatoria)}
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Ver detalles">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/convocatorias/${convocatoria.id_convocatoria}`)}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/convocatorias/edit/${convocatoria.id_convocatoria}`)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Descargar PDF">
                        <IconButton
                          size="small"
                          onClick={() => handleDownloadPdf(convocatoria.id_convocatoria)}
                        >
                          <Download fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Eliminar">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteClick(convocatoria.id_convocatoria)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Diálogo para eliminar */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          ¿Está seguro que desea eliminar esta convocatoria? Esta acción no se puede deshacer.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleDeleteConfirm} color="error">Eliminar</Button>
        </DialogActions>
      </Dialog>
      
      {/* Diálogo para cambiar estado con comentario */}
      <Dialog 
        open={estadoDialogOpen} 
        onClose={() => setEstadoDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {selectedEstado === 'EDIT_COMENTARIO' ? 'Editar Comentario' : `Cambiar estado a ${selectedEstado}`}
        </DialogTitle>
        <DialogContent>
          {(selectedEstado === 'Observado' || selectedEstado === 'Devuelto') && (
            <Typography paragraph>
              Por favor ingrese los motivos por los cuales la convocatoria está siendo {selectedEstado.toLowerCase()}:
            </Typography>
          )}
          
          <TextField
            autoFocus
            margin="dense"
            label="Comentario"
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            required={selectedEstado !== 'EDIT_COMENTARIO'}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEstadoDialogOpen(false)}>Cancelar</Button>
          <Button 
            onClick={() => selectedEstado === 'EDIT_COMENTARIO' 
              ? confirmEstadoChange(comentario) 
              : confirmEstadoChange(comentario)
            }
            disabled={!comentario && selectedEstado !== 'EDIT_COMENTARIO'}
            color="primary"
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar para mensajes */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ConvocatoriaList;