// frontend/src/components/usuarios/UsuarioForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUsuarios } from './hooks/useUsuarios';
import { 
  Box, TextField, Button, Select, MenuItem, InputLabel, 
  FormControl, Typography, Avatar, CircularProgress, Alert 
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';

const UsuarioForm = ({ isEdit = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { createUsuario, updateUsuario, loading } = useUsuarios();
  
  const [usuario, setUsuario] = useState({
    id_usuario: '',
    nombres: '',
    apellido_paterno: '',
    apellido_materno: '',
    rol: '',
    contraseña: '',
    celular: '',
    id_programa: ''
  });

  const [facultades, setFacultades] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [error, setError] = useState('');

  const rolesValidos = [
    { value: 'admin', label: 'Administrador' },
    { value: 'personal_administrativo', label: 'Personal Administrativo' },
    { value: 'secretaria_de_decanatura', label: 'Secretaría de Decanatura' },
    { value: 'tecnico_vicerrectorado', label: 'Técnico de Vicerrectorado' },
    { value: 'vicerrectorado', label: 'Vicerrectorado' }
  ];

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Cargar facultades
        const facResponse = await axios.get('/facultades');
        setFacultades(facResponse.data);

        if (isEdit && id) {
          const userResponse = await axios.get(`/usuarios/${id}`);
          setUsuario({
            ...userResponse.data,
            contraseña: '' // No mostrar la contraseña
          });
          if (userResponse.data.id_facultad) {
            const carrResponse = await axios.get(`/carreras/facultad/${userResponse.data.id_facultad}`);
            setCarreras(carrResponse.data);
          }
        }
      } catch (err) {
        setError('Error al cargar datos iniciales');
      }
    };

    fetchInitialData();
  }, [isEdit, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUsuario(prev => ({ ...prev, [name]: value }));
  };

  const handleFacultadChange = async (e) => {
    const idFacultad = e.target.value;
    setUsuario(prev => ({ ...prev, id_facultad: idFacultad, id_programa: '' }));
    
    try {
      const response = await axios.get(`/carreras/facultad/${idFacultad}`);
      setCarreras(response.data);
    } catch (err) {
      setError('Error al cargar carreras');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const usuarioData = { ...usuario };
      if (!usuarioData.contraseña) delete usuarioData.contraseña;

      const result = isEdit 
        ? await updateUsuario(id, usuarioData)
        : await createUsuario(usuarioData);

      if (result.success) {
        navigate('/usuarios', { state: { success: isEdit ? 'Usuario actualizado' : 'Usuario creado' } });
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Error al procesar la solicitud');
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/usuarios')}>
          Volver
        </Button>
        <Typography variant="h4" sx={{ ml: 2 }}>
          {isEdit ? 'Editar Usuario' : 'Crear Usuario'}
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="ID de Usuario"
              name="id_usuario"
              value={usuario.id_usuario}
              onChange={handleChange}
              required
              disabled={isEdit}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Nombres"
              name="nombres"
              value={usuario.nombres}
              onChange={handleChange}
              required
            />
          </Grid>

          {/* Resto de campos del formulario... */}
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button
            type="submit"
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
            disabled={loading}
          >
            {isEdit ? 'Actualizar' : 'Crear'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default UsuarioForm;