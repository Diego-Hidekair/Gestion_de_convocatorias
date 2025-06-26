// src/components/usuarios/UsuarioForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, TextField, Button, Select, MenuItem, InputLabel,
  FormControl, Typography, CircularProgress, Alert, Grid,
  Avatar, Paper
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
    contrasena: '',
    celular: '',
    id_programa: '',
    foto_file: null
  });

  const [errors, setErrors] = useState({});
  const [carreras, setCarreras] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loadingCarreras, setLoadingCarreras] = useState(false);
  const [fotoPreview, setFotoPreview] = useState(null);

  const rolesValidos = [
    { value: 'admin', label: 'Administrador' },
    { value: 'secretaria_de_decanatura', label: 'Secretaría de Decanatura' },
    { value: 'tecnico_vicerrectorado', label: 'Técnico de Vicerrectorado' },
    { value: 'vicerrectorado', label: 'Vicerrectorado' },
    { value: 'personal_administrativo', label: 'Personal Administrativo' }
  ];

  const rolesSinPrograma = [
    'admin',
    'personal_administrativo',
    'tecnico_vicerrectorado',
    'vicerrectorado'
  ];

  const requierePrograma = !rolesSinPrograma.includes(usuario.rol);

  const validateField = (name, value) => {
    let isValid = true;

    if (name === 'id_usuario') {
      isValid = value.trim().length > 0;
    } else if (name === 'nombres') {
      isValid = value.trim().length > 0;
    } else if (name === 'apellido_paterno') {
      isValid = value.trim().length > 0;
    } else if (name === 'rol') {
      isValid = value.trim().length > 0;
    } else if (name === 'contrasena' && !isEdit) {
      isValid = value.trim().length >= 6;
    } else if (name === 'id_programa' && requierePrograma) {
      isValid = value.trim().length > 0;
    }

    setErrors(prev => ({ ...prev, [name]: !isValid }));
    return isValid;
  };

  const validateForm = () => {
    const fieldsToValidate = ['id_usuario', 'nombres', 'apellido_paterno', 'rol'];
    if (!isEdit) fieldsToValidate.push('contrasena');

    let allValid = true;

    for (const field of fieldsToValidate) {
      const isValid = validateField(field, usuario[field]);
      if (!isValid) {
        console.log(`Fallo validación en campo: ${field}`, usuario[field]);
        allValid = false;
      }
    }
    if (requierePrograma && !usuario.id_programa) {
      console.log('Fallo validación: programa académico obligatorio pero no seleccionado');
      setError('El programa es obligatorio para el rol seleccionado');
      allValid = false;
    }

    return allValid;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('La imagen no debe superar los 2MB');
        return;
      }
      if (!file.type.match('image.*')) {
        setError('Por favor seleccione una imagen válida');
        return;
      }

      setUsuario(prev => ({ ...prev, foto_file: file }));
      if (fotoPreview) URL.revokeObjectURL(fotoPreview);
      setFotoPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingCarreras(true);
        const carrerasRes = await api.get('/carreras');
        setCarreras(carrerasRes.data);

        if (isEdit && id) {
          const res = await api.get(`/usuarios/${id}`);
          const user = res.data;

          let preview = null;
          if (user.foto_perfil) {
            preview = `data:image/jpeg;base64,${user.foto_perfil}`;
          }

          setUsuario({
            ...user,
            contrasena: ''
          });
          setFotoPreview(preview);
        }
      } catch (err) {
        console.error(err);
        setError('Error al cargar datos: ' + (err.response?.data?.error || err.message));
      } finally {
        setLoadingCarreras(false);
      }
    };

    fetchData();

    return () => {
      if (fotoPreview) URL.revokeObjectURL(fotoPreview);
    };
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUsuario(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      setError('Por favor complete todos los campos obligatorios correctamente');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('id_usuario', usuario.id_usuario);
      formData.append('nombres', usuario.nombres.trim());
      formData.append('apellido_paterno', usuario.apellido_paterno.trim());
      formData.append('apellido_materno', usuario.apellido_materno?.trim() || '');
      formData.append('rol', usuario.rol);
      formData.append('contrasena', usuario.contrasena || '');
      formData.append('celular', usuario.celular || '');

      if (requierePrograma && usuario.id_programa) {
        formData.append('id_programa', usuario.id_programa);
      } else {
        formData.append('id_programa', '');
      }

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
        if (result.details) console.error('Detalles:', result.details);
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message;
      setError(msg);
      console.error('Error completo:', err);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, flexWrap: 'wrap' }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/usuarios')} sx={{ mr: 2, mb: { xs: 1, sm: 0 } }}>
            Volver
          </Button>
          <Typography variant="h4" sx={{ flexGrow: 1, minWidth: 200 }}>
            {isEdit ? 'Editar Usuario' : 'Crear Usuario'}
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* Usamos xs=12 para que en móviles ocupe toda la fila */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="ID de Usuario"
                name="id_usuario"
                fullWidth
                value={usuario.id_usuario}
                onChange={handleChange}
                required
                disabled={isEdit}
                error={errors.id_usuario}
                helperText={errors.id_usuario && "Campo requerido"}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Nombres"
                name="nombres"
                fullWidth
                value={usuario.nombres}
                onChange={handleChange}
                required
                error={errors.nombres}
                helperText={errors.nombres && "Campo requerido"}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Apellido Paterno"
                name="apellido_paterno"
                fullWidth
                value={usuario.apellido_paterno}
                onChange={handleChange}
                required
                error={errors.apellido_paterno}
                helperText={errors.apellido_paterno && "Campo requerido"}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Apellido Materno"
                name="apellido_materno"
                fullWidth
                value={usuario.apellido_materno}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Rol</InputLabel>
                <Select
                  name="rol"
                  value={usuario.rol}
                  onChange={handleChange}
                  label="Rol"
                >
                  {rolesValidos.map(rol => (
                    <MenuItem key={rol.value} value={rol.value}>
                      {rol.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {!isEdit && (
              <Grid item xs={12} sm={6}>
                {/* Contraseña con comentario y validación */}
                <TextField
                  label="Contraseña"
                  name="contrasena"
                  type="password"
                  fullWidth
                  value={usuario.contrasena}
                  onChange={handleChange}
                  required
                  error={errors.contrasena}
                  helperText={errors.contrasena && "Mínimo 6 caracteres"}
                />
              </Grid>
            )}

            {isEdit && (
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Nueva Contraseña (opcional)"
                  name="contrasena"
                  type="password"
                  fullWidth
                  value={usuario.contrasena}
                  onChange={handleChange}
                />
              </Grid>
            )}

            <Grid item xs={12} sm={6}>
              <TextField
                label="Celular"
                name="celular"
                fullWidth
                value={usuario.celular}
                onChange={handleChange}
              />
            </Grid>

            {requierePrograma && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Programa Académico</InputLabel>
                  <Select
                    name="id_programa"
                    value={usuario.id_programa || ''}
                    onChange={handleChange}
                    disabled={loadingCarreras}
                    sx={{
                      minWidth: '100%',
                      '& .MuiSelect-select': {
                        padding: '10.5px 14px',
                      }
                    }}
                  >
                    <MenuItem value="">
                      <em>Seleccione un programa</em>
                    </MenuItem>
                    {carreras.map(c => (
                      <MenuItem key={c.id_programa} value={c.id_programa}>
                        {c.programa} ({c.nombre_facultad})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12}>
              <Typography variant="h6">Foto de Perfil</Typography>
              {fotoPreview && (
                <Avatar src={fotoPreview} sx={{ width: 100, height: 100, mb: 1 }} />
              )}
              <Button variant="outlined" component="label">
                Seleccionar Imagen
                <input type="file" hidden accept="image/*" onChange={handleFileChange} />
              </Button>
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
              disabled={loading}
            >
              {isEdit ? 'Actualizar Usuario' : 'Crear Usuario'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default UsuarioForm;
