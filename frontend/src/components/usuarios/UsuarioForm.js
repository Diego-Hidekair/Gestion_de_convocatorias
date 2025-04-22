// src/components/usuarios/UsuarioForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Box, TextField, Button, Select, MenuItem, InputLabel, 
  FormControl, Typography, CircularProgress, Alert, 
  Grid, Avatar, Checkbox, FormControlLabel
} from '@mui/material';
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
        setUsuario(prev => ({ ...prev, foto_file: file }));
        setFotoPreview(URL.createObjectURL(file));
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
        
        // Agregar todos los campos al FormData
        formData.append('id_usuario', usuario.id_usuario);
        formData.append('nombres', usuario.nombres);
        formData.append('apellido_paterno', usuario.apellido_paterno);
        formData.append('apellido_materno', usuario.apellido_materno || '');
        formData.append('rol', usuario.rol);
        formData.append('contraseña', usuario.contraseña || '');
        formData.append('celular', usuario.celular || '');
        formData.append('id_programa', usuario.id_programa || '');

        // Solo agregar la imagen si se seleccionó un archivo
        if (usuario.foto_file) {
            formData.append('foto_perfil', usuario.foto_file);
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
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="ID de Usuario"
              name="id_usuario"
              value={usuario.id_usuario}
              onChange={handleChange}
              required
              disabled={isEdit}
              margin="normal"
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
              margin="normal"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Apellido Paterno"
              name="apellido_paterno"
              value={usuario.apellido_paterno}
              onChange={handleChange}
              required
              margin="normal"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Apellido Materno"
              name="apellido_materno"
              value={usuario.apellido_materno}
              onChange={handleChange}
              margin="normal"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Rol</InputLabel>
              <Select
                name="rol"
                value={usuario.rol}
                onChange={handleChange}
                label="Rol"
              >
                {rolesValidos.map((rol) => (
                  <MenuItem key={rol.value} value={rol.value}>
                    {rol.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {!isEdit && (
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="password"
                label="Contraseña"
                name="contraseña"
                value={usuario.contraseña}
                onChange={handleChange}
                required
                margin="normal"
              />
            </Grid>
          )}

          {isEdit && (
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="password"
                label="Nueva Contraseña (dejar vacío para no cambiar)"
                name="contraseña"
                value={usuario.contraseña}
                onChange={handleChange}
                margin="normal"
              />
            </Grid>
          )}

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Celular"
              name="celular"
              value={usuario.celular}
              onChange={handleChange}
              margin="normal"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Programa Académico</InputLabel>
              <Select
                name="id_programa"
                value={usuario.id_programa || ''}
                onChange={handleChange}
                label="Programa Académico"
                disabled={loadingCarreras}
              >
                <MenuItem value="">
                  <em>Seleccione un programa</em>
                </MenuItem>
                {carreras.map((carrera) => (
                  <MenuItem 
                    key={carrera.id_programa} 
                    value={carrera.id_programa}
                  >
                    {carrera.programa} ({carrera.nombre_facultad})
                  </MenuItem>
                ))}
              </Select>
              {loadingCarreras && (
                <CircularProgress size={24} sx={{ position: 'absolute', right: 10, top: '50%' }} />
              )}
            </FormControl>
          </Grid>

          {/* Sección de Foto de Perfil */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
                Foto de Perfil
            </Typography>
            
            {fotoPreview && (
                <Avatar 
                    src={fotoPreview} 
                    sx={{ width: 100, height: 100, mb: 2 }}
                />
            )}
            <Button
              variant="outlined"
              component="label"
              sx={{ width: 'fit-content' }}
          >
              Seleccionar Imagen
              <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleFileChange}
              />
          </Button>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={!useFotoUrl}
                    onChange={() => setUseFotoUrl(false)}
                  />
                }
                label="Subir imagen desde dispositivo"
              />
              
              {!useFotoUrl && (
                <Button
                  variant="outlined"
                  component="label"
                  sx={{ width: 'fit-content' }}
                >
                  Seleccionar Imagen
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </Button>
              )}
              
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={useFotoUrl}
                    onChange={() => setUseFotoUrl(true)}
                  />
                }
                label="Usar URL de imagen"
              />
              
              {useFotoUrl && (
                <TextField
                  fullWidth
                  label="URL de la imagen"
                  name="foto_url"
                  value={usuario.foto_url || ''}
                  onChange={handleFotoUrlChange}
                  margin="normal"
                />
              )}
            </Box>
          </Grid>
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