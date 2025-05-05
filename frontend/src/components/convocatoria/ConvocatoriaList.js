// frontend/src/components/Convocatoria/ConvocatoriaList.js
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box, TextField, MenuItem, FormControl, InputLabel, Select, Button, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert } from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Visibility as VisibilityIcon,
  Comment as CommentIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuth from '../../hooks/useAuth';

const ConvocatoriaList = () => {
  const [convocatorias, setConvocatorias] = useState([]);
  const [filteredConvocatorias, setFilteredConvocatorias] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('nombre_conv');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [convocatoriaToDelete, setConvocatoriaToDelete] = useState(null);
  const [comentarioDialogOpen, setComentarioDialogOpen] = useState(false);
  const [comentario, setComentario] = useState('');
  const [selectedConvocatoria, setSelectedConvocatoria] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConvocatorias = async () => {
      try {
        let url = '/convocatorias';
        if (user.rol === 'secretaria_de_decanatura') {
          url = '/convocatorias/facultad/actual';
        }
        
        const response = await axios.get(url);
        setConvocatorias(response.data);
        setFilteredConvocatorias(response.data);
      } catch (error) {
        showSnackbar('Error al cargar convocatorias', 'error');
      }
    };

    fetchConvocatorias();
  }, [user.rol]);

  useEffect(() => {
    const filtered = convocatorias.filter(conv => 
      conv[searchCategory]?.toString().toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredConvocatorias(filtered);
  }, [searchQuery, searchCategory, convocatorias]);

  const handleEstadoChange = async (id, estado) => {
    try {
      await axios.put(`/convocatorias/${id}/estado`, { estado });
      const updated = convocatorias.map(conv => 
        conv.id_convocatoria === id ? { ...conv, estado } : conv
      );
      setConvocatorias(updated);
      showSnackbar('Estado actualizado correctamente', 'success');
    } catch (error) {
      showSnackbar('Error al actualizar estado', 'error');
    }
  };

  const handleComentarioSubmit = async () => {
    try {
      await axios.put(`/convocatorias/${selectedConvocatoria.id_convocatoria}/comentario`, { 
        comentario_observado: comentario 
      });
      
      const updated = convocatorias.map(conv => 
        conv.id_convocatoria === selectedConvocatoria.id_convocatoria ? 
        { ...conv, comentario_observado: comentario } : conv
      );
      
      setConvocatorias(updated);
      setComentarioDialogOpen(false);
      showSnackbar('Comentario guardado', 'success');
    } catch (error) {
      showSnackbar('Error al guardar comentario', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/convocatorias/${convocatoriaToDelete}`);
      setConvocatorias(conv => conv.filter(c => c.id_convocatoria !== convocatoriaToDelete));
      setDeleteDialogOpen(false);
      showSnackbar('Convocatoria eliminada', 'success');
    } catch (error) {
      showSnackbar('Error al eliminar convocatoria', 'error');
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Para Revisión': return 'default';
      case 'En Revisión': return 'primary';
      case 'Observado': return 'warning';
      case 'Revisado': return 'info';
      case 'Aprobado': return 'success';
      case 'Devuelto': return 'error';
      case 'Para Publicar': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Lista de Convocatorias
      </Typography>

      <Box display="flex" gap={2} mb={3}>
        <TextField
          label="Buscar"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        
        <FormControl variant="outlined" size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Categoría</InputLabel>
          <Select
            value={searchCategory}
            onChange={(e) => setSearchCategory(e.target.value)}
            label="Categoría"
          >
            <MenuItem value="nombre_conv">Nombre</MenuItem>
            <MenuItem value="nombre_programa">Programa</MenuItem>
            <MenuItem value="nombre_facultad">Facultad</MenuItem>
            <MenuItem value="estado">Estado</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Programa</TableCell>
              <TableCell>Fecha Inicio</TableCell>
              <TableCell>Fecha Fin</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredConvocatorias.map(conv => (
              <TableRow key={conv.id_convocatoria}>
                <TableCell>{conv.nombre_conv}</TableCell>
                <TableCell>{conv.nombre_programa}</TableCell>
                <TableCell>{new Date(conv.fecha_inicio).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(conv.fecha_fin).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip 
                      label={conv.estado} 
                      color={getEstadoColor(conv.estado)} 
                    />
                    {conv.comentario_observado && (
                      <IconButton 
                        size="small" 
                        onClick={() => {
                          setSelectedConvocatoria(conv);
                          setComentario(conv.comentario_observado);
                          setComentarioDialogOpen(true);
                        }}
                      >
                        <CommentIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => navigate(`/convocatorias/${conv.id_convocatoria}`)}>
                    <VisibilityIcon />
                  </IconButton>
                  
                  {user.rol === 'secretaria_de_decanatura' && (
                    <IconButton onClick={() => navigate(`/convocatorias/${conv.id_convocatoria}/editar`)}>
                      <EditIcon />
                    </IconButton>
                  )}
                  
                  {user.rol === 'admin' && (
                    <IconButton onClick={() => {
                      setConvocatoriaToDelete(conv.id_convocatoria);
                      setDeleteDialogOpen(true);
                    }}>
                      <DeleteIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Diálogo para eliminar */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          ¿Está seguro que desea eliminar esta convocatoria?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleDelete} color="error">Eliminar</Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para comentarios */}
      <Dialog 
        open={comentarioDialogOpen} 
        onClose={() => setComentarioDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {selectedConvocatoria?.comentario_observado ? 'Comentario' : 'Agregar Comentario'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            disabled={!!selectedConvocatoria?.comentario_observado}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setComentarioDialogOpen(false)}>Cancelar</Button>
          {!selectedConvocatoria?.comentario_observado && (
            <Button onClick={handleComentarioSubmit} variant="contained">
              Guardar
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ConvocatoriaList;