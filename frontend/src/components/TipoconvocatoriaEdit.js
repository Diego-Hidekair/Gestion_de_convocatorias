// src/components/TipoconvocatoriaEdit.js
import React, { useState, useEffect } from 'react';
import api from '../config/axiosConfig'; 
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Typography, Box, TextField, Button, Paper, Alert, Snackbar, CircularProgress } from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';

const TipoconvocatoriaEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tipoConvocatoria, setTipoConvocatoria] = useState({
    Nombre_convocatoria: '',
    Titulo: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    const fetchTipoConvocatoria = async () => {
      try {
        const response = await api.get(`/tipos-convocatorias/${id}`);
        setTipoConvocatoria({
          Nombre_convocatoria: response.data.Nombre_convocatoria || '',
          Titulo: response.data.Titulo || ''
        });
        setLoading(false);
      } catch (error) {
        console.error('Error al obtener el tipo de convocatoria:', error);
        setError('Error al cargar el tipo de convocatoria');
        setLoading(false);
      }
    };

    fetchTipoConvocatoria();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTipoConvocatoria(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!tipoConvocatoria.Nombre_convocatoria) {
      setError("Por favor, complete el campo del nombre de convocatoria.");
      return;
    }

    try {
      await api.put(`/tipos-convocatorias/${id}`, tipoConvocatoria);
      setOpenSnackbar(true);
      setTimeout(() => navigate('/tipos-convocatorias'), 1500);
    } catch (error) {
      console.error('Error al actualizar el tipo de convocatoria:', error);
      setError("Hubo un error al actualizar la convocatoria. Intenta nuevamente.");
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
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
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button variant="contained" onClick={() => navigate('/tipos-convocatorias')} sx={{ mt: 2 }}>
          Volver a la lista
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Editar Tipo de Convocatoria
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <TextField
            fullWidth
            label="Nombre de Convocatoria"
            name="Nombre_convocatoria"
            value={tipoConvocatoria.Nombre_convocatoria}
            onChange={handleChange}
            required
            margin="normal"
            variant="outlined"
          />

          <TextField
            fullWidth
            label="Título"
            name="Titulo"
            value={tipoConvocatoria.Titulo}
            onChange={handleChange}
            margin="normal"
            variant="outlined"
            inputProps={{ maxLength: 500 }}
            helperText={`${tipoConvocatoria.Titulo.length}/500 caracteres`}
            multiline
            rows={4}
          />

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              startIcon={<SaveIcon />}
              sx={{ mr: 2 }}
            >
              Guardar Cambios
            </Button>

            <Button
              variant="outlined"
              onClick={() => navigate('/tipos-convocatorias')}
            >
              Cancelar
            </Button>
          </Box>
        </Box>
      </Paper>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message="Tipo de convocatoria actualizado exitosamente"
      />
    </Container>
  );
};

export default TipoconvocatoriaEdit;
