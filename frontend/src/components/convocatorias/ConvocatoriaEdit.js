// frontend/src/components/ConvocatoriaEdit.js
import React, { useState, useEffect } from 'react';
import api from '../../config/axiosConfig'
import { useNavigate, useParams } from 'react-router-dom';
import { Container, TextField, Button, Typography, Card, CardContent, Grid, Box, FormControl, InputLabel, Select, MenuItem, Alert } from '@mui/material';

const ConvocatoriaEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [convocatoria, setConvocatoria] = useState({
    cod_convocatoria: '',
    nombre: '',
    fecha_inicio: '',
    fecha_fin: '',
    id_tipoconvocatoria: '',
    id_carrera: '',
    id_facultad: '',
    horario: 'TIEMPO COMPLETO',
    prioridad: 'PRIMERA',
    gestion: 'GESTION 1',
    estado: '',
    comentario_observado: ''
  });

    const [tiposConvocatoria, setTiposConvocatoria] = useState([]);
    const [carreras, setCarreras] = useState([]);
    const [facultades, setFacultades] = useState([]);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        setUserRole(decoded.rol);
      } catch {
        setUserRole('');
      }
    }

        const fetchConvocatoria = async () => {
            try {
                const response = await api.get(`/convocatorias/${id}`);
                const data = response.data;
                setConvocatoria({
                ...data,
                fecha_inicio: data.fecha_inicio.split('T')[0],
                fecha_fin: data.fecha_fin ? data.fecha_fin.split('T')[0] : '',
                });
            } catch (error) {
                console.error('Error fetching convocatoria:', error);
                setError('Error al cargar los datos de la convocatoria.');
            }
        };

        const fetchTiposConvocatoria = async () => {
            try {
                const response = await api.get('/tipos-convocatorias');
                setTiposConvocatoria(response.data);
            } catch (error) {
                console.error('Error fetching tipos de convocatoria:', error);
                setError('Error al cargar los tipos de convocatoria.');
            }
        };

        const fetchCarreras = async () => {
            try {
                const response = await api.get('/carreras');
                setCarreras(response.data);
            } catch (error) {
                console.error('Error fetching carreras:', error);
                setError('Error al cargar las carreras.');
            }
    };

        const fetchFacultades = async () => {
            try {
                const response = await api.get('/facultades');
                setFacultades(response.data);
            } catch (error) {
                console.error('Error fetching facultades:', error);
                setError('Error al cargar las facultades.');
            }
        };

        fetchConvocatoria();
        fetchTiposConvocatoria();
        fetchCarreras();
        fetchFacultades();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setConvocatoria(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        try {
        await api.put(`/convocatorias/${id}`, convocatoria);
        setSuccess('Convocatoria actualizada correctamente.');

        const pdfResponse = await api.get(`/pdf/generar/${id}/1`);
        if (pdfResponse.status === 201) {
            setSuccess(prev => `${prev} PDF regenerado correctamente.`);
        } else {
            setError('Hubo un error al regenerar el PDF.');
        }

        setTimeout(() => navigate('/convocatorias'), 2000);
        } catch (error) {
        console.error('Error updating convocatoria:', error);
        setError('Error al actualizar la convocatoria.');
        }
    };


    const handleEstadoChange = async (nuevoEstado, comentario = null) => {
    try {
        const payload = { estado: nuevoEstado };
        if (comentario) payload.comentario_observado = comentario;

        await api.patch(`/convocatorias/${id}/estado`, payload);
        setSuccess(`Estado cambiado a ${nuevoEstado} correctamente.`);

        const response = await api.get(`/convocatorias/${id}`);
        const data = response.data;
        setConvocatoria({
            ...data,
            fecha_inicio: data.fecha_inicio.split('T')[0],
            fecha_fin: data.fecha_fin ? data.fecha_fin.split('T')[0] : '',
        });
        } catch (error) {
        console.error('Error cambiando estado:', error);
        setError('Error al cambiar el estado de la convocatoria.');
        }
    };

    const handleEditComentario = async () => {
        const nuevoComentario = prompt('Editar comentario:', convocatoria.comentario_observado);
        if (nuevoComentario !== null) {
        try {
            await api.patch(`/convocatorias/${id}/comentario`, {
            comentario_observado: nuevoComentario
            });
            setSuccess('Comentario actualizado correctamente.');
            setConvocatoria(prev => ({
            ...prev,
            comentario_observado: nuevoComentario
            }));
        } catch (error) {
            console.error('Error actualizando comentario:', error);
            setError('Error al actualizar el comentario.');
        }
        }
    };

    return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Editar Convocatoria
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Formulario de Convocatoria
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="Código"
                  fullWidth
                  name="cod_convocatoria"
                  value={convocatoria.cod_convocatoria}
                  onChange={handleChange}
                  InputProps={{ readOnly: true }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Nombre"
                  fullWidth
                  name="nombre"
                  value={convocatoria.nombre}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Fecha de Inicio"
                  type="date"
                  fullWidth
                  name="fecha_inicio"
                  value={convocatoria.fecha_inicio}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Fecha de Fin"
                  type="date"
                  fullWidth
                  name="fecha_fin"
                  value={convocatoria.fecha_fin}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Tipo de Convocatoria</InputLabel>
                  <Select
                    name="id_tipoconvocatoria"
                    value={convocatoria.id_tipoconvocatoria}
                    onChange={handleChange}
                    label="Tipo de Convocatoria"
                    required
                  >
                    {tiposConvocatoria.map((tipo) => (
                      <MenuItem key={tipo.id_tipoconvocatoria} value={tipo.id_tipoconvocatoria}>
                        {tipo.nombre_convocatoria}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Carrera</InputLabel>
                  <Select
                    name="id_carrera"
                    value={convocatoria.id_carrera}
                    onChange={handleChange}
                    label="Carrera"
                    required
                  >
                    {carreras.map((carrera) => (
                      <MenuItem key={carrera.id_carrera} value={carrera.id_carrera}>
                        {carrera.nombre_carrera}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Facultad</InputLabel>
                  <Select
                    name="id_facultad"
                    value={convocatoria.id_facultad}
                    onChange={handleChange}
                    label="Facultad"
                    required
                  >
                    {facultades.map((facultad) => (
                      <MenuItem key={facultad.id_facultad} value={facultad.id_facultad}>
                        {facultad.nombre_facultad}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                >
                  Actualizar
                </Button>
              </Grid>
            </Grid>
          </Box>

          {['tecnico_vicerrectorado', 'vicerrectorado', 'admin'].includes(userRole) && (
            <Box mt={4}>
              <Typography variant="h6" gutterBottom>
                Cambiar Estado
              </Typography>
              <Box display="flex" gap={2} flexWrap="wrap">
                {convocatoria.estado === 'Para Revisión' && (
                  <Button
                    variant="contained"
                    color="info"
                    onClick={() => handleEstadoChange('En Revisión')}
                  >
                    Marcar como En Revisión
                  </Button>
                )}

                {convocatoria.estado === 'En Revisión' && (
                  <>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => handleEstadoChange('Revisado')}
                    >
                      Marcar como Revisado
                    </Button>
                    <Button
                      variant="contained"
                      color="warning"
                      onClick={async () => {
                        const comentario = prompt('Ingrese el motivo de la observación:');
                        if (comentario) {
                          await handleEstadoChange('Observado', comentario);
                        }
                      }}
                    >
                      Marcar como Observado
                    </Button>
                  </>
                )}

                {convocatoria.estado === 'Revisado' && userRole === 'vicerrectorado' && (
                  <>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleEstadoChange('Aprobado')}
                    >
                      Aprobar
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={async () => {
                        const comentario = prompt('Ingrese el motivo del rechazo:');
                        if (comentario) {
                          await handleEstadoChange('Devuelto', comentario);
                        }
                      }}
                    >
                      Rechazar (Devolver)
                    </Button>
                  </>
                )}

                {convocatoria.estado === 'Aprobado' && userRole === 'vicerrectorado' && (
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => handleEstadoChange('Para Publicar')}
                  >
                    Marcar para Publicación
                  </Button>
                )}
              </Box>
            </Box>
          )}

          {['Observado', 'Devuelto'].includes(convocatoria.estado) && (
            <Box mt={4}>
              <Typography variant="h6" gutterBottom>
                Comentario
              </Typography>
              <Typography paragraph>{convocatoria.comentario_observado}</Typography>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleEditComentario}
              >
                Editar Comentario
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default ConvocatoriaEdit;