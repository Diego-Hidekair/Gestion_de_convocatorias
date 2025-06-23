// src/components/TipoconvocatoriaForm.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {Container, Typography, Box, TextField, Button, Paper, Alert, Snackbar} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';

const TipoconvocatoriaForm = () => {
  const navigate = useNavigate();
  const [tipoConvocatoria, setTipoConvocatoria] = useState({ 
    Nombre_convocatoria: '', 
    Titulo: '' 
  });
  const [error, setError] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTipoConvocatoria({ ...tipoConvocatoria, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!tipoConvocatoria.Nombre_convocatoria) {
      setError("Por favor, complete el campo del nombre de convocatoria.");
      return;
    }
    if (tipoConvocatoria.Titulo.length > 200) {
      setError("El título no puede exceder los 200 caracteres.");
      return;
    }

    try {
      await axios.post('http://localhost:5000/tipos-convocatorias', tipoConvocatoria);
      setOpenSnackbar(true);
      setTimeout(() => navigate('/tipos-convocatorias'), 1500);
    } catch (error) {
      console.error('Error al crear tipo de convocatoria:', error);
      setError('Error al crear el tipo de convocatoria');
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Crear Nuevo Tipo de Convocatoria
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
              Guardar
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
        message="Tipo de convocatoria creado exitosamente"
      />
    </Container>
  );
};

export default TipoconvocatoriaForm;