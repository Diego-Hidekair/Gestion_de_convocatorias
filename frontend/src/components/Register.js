// frontend/src/components/Register.js
import React, { useState } from 'react';
import api from '../config/axiosConfig';  
import { TextField, Button, Container, Typography, Box, MenuItem, Select, InputLabel, FormControl, Alert, Snackbar } from '@mui/material';

const Register = () => {
  const [formData, setFormData] = useState({
    id: '',
    nombres: '',
    apellido_paterno: '',
    apellido_materno: '',
    rol: 'personal_administrativo',
    contrasena: '',
    celular: ''
  });

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
        ...formData,
        [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
        await api.post('/usuarios/register', formData);
        setSnackbar({
            open: true,
            message: 'Usuario creado exitosamente',
            severity: 'success'
        });
        setFormData({
            id: '',
            nombres: '',
            apellido_paterno: '',
            apellido_materno: '',
            rol: 'personal_administrativo',
            contrasena: '',
            celular: ''
        });
        } catch (error) {
        console.error('Error al crear usuario:', error);
        setSnackbar({
            open: true,
            message: 'Error al crear usuario. Por favor, inténtelo de nuevo.',
            severity: 'error'
        });
        }
    };
    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h5" mb={3}>Registrar Usuario</Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          fullWidth
          margin="normal"
          label="ID"
          name="id"
          value={formData.id}
          onChange={handleChange}
          required
        />
        <TextField
          fullWidth
          margin="normal"
          label="Nombres"
          name="nombres"
          value={formData.nombres}
          onChange={handleChange}
          required
        />
        <TextField
          fullWidth
          margin="normal"
          label="Apellido Paterno"
          name="apellido_paterno"
          value={formData.apellido_paterno}
          onChange={handleChange}
          required
        />
        <TextField
          fullWidth
          margin="normal"
          label="Apellido Materno"
          name="apellido_materno"
          value={formData.apellido_materno}
          onChange={handleChange}
          required
        />
        <TextField
          fullWidth
          margin="normal"
          label="Contraseña"
          type="password"
          name="contrasena"
          value={formData.contrasena}
          onChange={handleChange}
          required
        />
        <TextField
          fullWidth
          margin="normal"
          label="Celular"
          name="celular"
          value={formData.celular}
          onChange={handleChange}
          required
        />
        <FormControl fullWidth margin="normal" required>
          <InputLabel id="rol-label">Rol</InputLabel>
          <Select
            labelId="rol-label"
            name="rol"
            value={formData.rol}
            label="Rol"
            onChange={handleChange}
          >
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="personal_administrativo">Personal Administrativo</MenuItem>
            <MenuItem value="secretaria_de_decanatura">Secretaría de Decanatura</MenuItem>
            <MenuItem value="tecnico_vicerrectorado">Técnico de Vicerrectorado</MenuItem>
            <MenuItem value="vicerrectorado">Vicerrectorado</MenuItem>
          </Select>
        </FormControl>
        <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
          Registrar Usuario
        </Button>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Register;