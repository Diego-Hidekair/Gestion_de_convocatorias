// src/components/usuarios/UsuarioForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, TextField, Button, Select, MenuItem, InputLabel, FormControl, Typography, CircularProgress, Alert, Grid, Avatar, Checkbox, FormControlLabel, Pagination} from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import useUsuarios from './hooks/useUsuarios';
import api from '../../config/axiosConfig';

const UsuarioForm = ({ isEdit = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { createUsuario, updateUsuario, loading } = useUsuarios();
  
  const [usuario, setUsuario] = useState({
    id_usuario: '',
    nombres: '',
    apellido_paterno: '',
    apellido_materno: '',
    rol: 'secretaria_de_decanatura',
    contraseña: '',
    celular: '',
    id_programa: '',
    foto_url: '',
    foto_file: null
  });

  const [carreras, setCarreras] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loadingCarreras, setLoadingCarreras] = useState(false);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [useFotoUrl, setUseFotoUrl] = useState(false);

  const rolesValidos = [
    { value: 'admin', label: 'Administrador' },
    { value: 'secretaria_de_decanatura', label: 'Secretaría de Decanatura' },
    { value: 'tecnico_vicerrectorado', label: 'Técnico de Vicerrectorado' },
    { value: 'vicerrectorado', label: 'Vicerrectorado' }
  ];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUsuario(prev => ({ ...prev, foto_file: file, foto_url: '' }));
      setFotoPreview(URL.createObjectURL(file));
      setUseFotoUrl(false);
    }
  };

  const handleFotoUrlChange = (e) => {
    const url = e.target.value;
    setUsuario(prev => ({ ...prev, foto_url: url, foto_file: null }));
    setFotoPreview(url);
    setUseFotoUrl(true);
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoadingCarreras(true);
        
        // Cargar carreras
        const carrerasResponse = await api.get('/carreras');
        setCarreras(carrerasResponse.data);

        if (isEdit && id) {
          const userResponse = await api.get(`/usuarios/${id}`);
          const userData = userResponse.data;
          
          // Manejar la foto de perfil
          let preview = null;
          if (userData.foto_perfil) {
            preview = `data:image/jpeg;base64,${userData.foto_perfil}`;
          }

          setUsuario({
            ...userData,
            contraseña: '',
            foto_url: ''
          });
          setFotoPreview(preview);
        }
      } catch (err) {
        setError('Error al cargar datos iniciales');
        console.error(err);
      } finally {
        setLoadingCarreras(false);
      }
    };

    fetchInitialData();
  }, [isEdit, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUsuario(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validación de campos obligatorios
    if (!isEdit && !usuario.contraseña) {
      setError('La contraseña es obligatoria para nuevos usuarios');
      return;
    }
    if (!usuario.id_usuario || !usuario.nombres || !usuario.apellido_paterno || !usuario.rol) {
      setError('Por favor complete todos los campos obligatorios');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('id_usuario', usuario.id_usuario);
      formData.append('nombres', usuario.nombres);
      formData.append('apellido_paterno', usuario.apellido_paterno);
      formData.append('apellido_materno', usuario.apellido_materno || '');
      formData.append('rol', usuario.rol);
      formData.append('contraseña', usuario.contraseña || '');
      formData.append('celular', usuario.celular || '');
      formData.append('id_programa', usuario.id_programa || '');

      // Manejo de imagen
      if (usuario.foto_file) {
        formData.append('foto_perfil', usuario.foto_file);
      } else if (usuario.foto_url) {
        formData.append('foto_url', usuario.foto_url);
      }

      const result = isEdit 
        ? await updateUsuario(id, formData)
        : await createUsuario(formData);

      if (result.success) {
        setSuccess(isEdit ? 'Usuario actualizado correctamente' : 'Usuario creado correctamente');
        setTimeout(() => navigate('/usuarios'), 1500);
      } else {
        setError(result.error || 'Error al procesar la solicitud');
      }
    } catch (err) {
      setError(err.message || 'Error al procesar la solicitud');
      console.error('Error completo:', err);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/usuarios')}
          sx={{ mr: 2 }}
        >
          Volver
        </Button>
        <Typography variant="h4">
          {isEdit ? 'Editar Usuario' : 'Crear Usuario'}
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          {/* Campos del formulario (igual que antes) */}
          {/* ... */}
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            startIcon={loading ? <CircularProgress size={24} /> : <SaveIcon />}
            disabled={loading}
          >
            {isEdit ? 'Actualizar Usuario' : 'Crear Usuario'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default UsuarioForm;