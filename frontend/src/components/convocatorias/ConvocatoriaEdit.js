// frontend/src/components/ConvocatoriaEdit.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../config/axiosConfig';
import { 
  Container, TextField, Button, Typography, Card, CardContent,
  Grid, Box, FormControl, InputLabel, Select, MenuItem, Alert, 
  CircularProgress 
} from '@mui/material';
import { LocalizationProvider, StaticDatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, parseISO, addDays } from 'date-fns';

const ConvocatoriaEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [convocatoria, setConvocatoria] = useState({
    nombre: '',
    fecha_inicio: new Date(),
    fecha_fin: null,
    id_tipoconvocatoria: '',
    id_programa: '',
    tipo_jornada: 'TIEMPO COMPLETO',
    etapa_convocatoria: 'PRIMERA',
    gestion: 'GESTION 1',
    resolucion: '',
    dictamen: '',
    perfil_profesional: '',
    pago_mensual: 0,
    comentario_observado: '',
    estado: ''
  });

  const [tiposConvocatoria, setTiposConvocatoria] = useState([]);
  const [carrerasFiltradas, setCarrerasFiltradas] = useState([]);
  const [programaSeleccionado, setProgramaSeleccionado] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const userResponse = await api.get('/usuarios/me');
        const userData = userResponse.data;

        const [tiposResponse, carrerasResponse] = await Promise.all([
          api.get('/tipos-convocatorias'),
          api.get(`/carreras/facultad-id/${userData.id_facultad}`)
        ]);

        const carreras = carrerasResponse.data.map(c => ({
          ...c,
          id_programa: c.id_programa.trim()
        }));

        setTiposConvocatoria(tiposResponse.data);
        setCarrerasFiltradas(carreras);

        if (id) {
          const response = await api.get(`/convocatorias/${id}`);
          const data = response.data;

          const fechaInicio = data.fecha_inicio ? parseISO(data.fecha_inicio) : new Date();
          const fechaFin = data.fecha_fin ? parseISO(data.fecha_fin) : addDays(fechaInicio, 10);

          const programa = carreras.find(p => p.id_programa === data.id_programa?.trim());
          if (programa) setProgramaSeleccionado(programa.programa || programa.nombre_carrera);

          setConvocatoria({
            nombre: data.nombre_conv || '',
            fecha_inicio: fechaInicio,
            fecha_fin: fechaFin,
            id_tipoconvocatoria: data.id_tipoconvocatoria || '',
            id_programa: data.id_programa?.trim() || '',
            tipo_jornada: data.tipo_jornada || 'TIEMPO COMPLETO',
            etapa_convocatoria: data.etapa_convocatoria || 'PRIMERA',
            gestion: data.gestion || 'GESTION 1',
            resolucion: data.resolucion || '',
            dictamen: data.dictamen || '',
            perfil_profesional: data.perfil_profesional || '',
            pago_mensual: data.pago_mensual || 0,
            comentario_observado: data.comentario_observado || '',
            estado: data.estado || ''
          });
        }
      } catch (error) {
          console.error('Error al cargar datos:', error);
          setError(error.response?.data?.error || 'Error al cargar datos de la convocatoria');
        }
    };

    cargarDatos();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConvocatoria(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'id_programa') {
      const programa = carrerasFiltradas.find(p => p.id_programa === value);
      if (programa) {
        setProgramaSeleccionado(programa.programa || programa.nombre_carrera);
      }
    }
  };

  const handleDateInicioChange = (date) => {
    setConvocatoria(prev => ({
      ...prev,
      fecha_inicio: date,
      fecha_fin: addDays(date, 10)
    }));
  };

  useEffect(() => {
    const year = new Date().getFullYear();
    let nuevoNombre = '';

    if (convocatoria.etapa_convocatoria) {
      nuevoNombre += `${convocatoria.etapa_convocatoria} `;
    }

    nuevoNombre += 'CONVOCATORIA ';

    const tipoSeleccionado = tiposConvocatoria.find(t =>
      t.id_tipoconvocatoria.toString() === convocatoria.id_tipoconvocatoria?.toString()
    );

    const tipoNombre = tipoSeleccionado?.nombre_tipo_conv?.toUpperCase() || '';

    if (tipoNombre.includes('EXTRAORDINARIO')) {
      nuevoNombre += 'A CONCURSO DE MÉRITOS PARA LA PROVISIÓN DE DOCENTE EXTRAORDINARIO EN CALIDAD DE INTERINO ';
    } else if (tipoNombre.includes('ORDINARIO')) {
      nuevoNombre += 'A CONCURSO DE MÉRITOS Y EXÁMENES DE COMPETENCIA PARA LA PROVISIÓN DE DOCENTE ORDINARIO ';
    } else if (tipoNombre.includes('CONSULTORES')) {
      nuevoNombre += 'A CONCURSO DE MÉRITOS PARA LA CONTRATACIÓN DE DOCENTES EN CALIDAD DE CONSULTORES DE LÍNEA ';
    } else if (tipoNombre) {
      nuevoNombre += `${tipoNombre} `;
    }

    if (convocatoria.tipo_jornada) {
      nuevoNombre += `A ${convocatoria.tipo_jornada} `;
    }

    if (programaSeleccionado) {
      nuevoNombre += `PARA LA CARRERA DE ${programaSeleccionado} `;
    }

    if (tipoNombre.includes('EXTRAORDINARIO')) {
      nuevoNombre += `SOLO POR LA GESTIÓN ACADÉMICA ${year}`;
    } else {
      nuevoNombre += `- GESTION ${year}`;
    }

    setConvocatoria(prev => ({ ...prev, nombre: nuevoNombre.trim() }));
  }, [
    convocatoria.id_tipoconvocatoria,
    convocatoria.tipo_jornada,
    convocatoria.etapa_convocatoria,
    programaSeleccionado,
    tiposConvocatoria
  ]);

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validación de fechas
  if (convocatoria.fecha_fin <= convocatoria.fecha_inicio) {
    setError('La fecha de fin debe ser posterior a la fecha de inicio');
    return;
  }

  try {
    setLoading(true);
    setError(null);
    
    const payload = {
      ...convocatoria,
      nombre_conv: convocatoria.nombre,
      fecha_inicio: format(convocatoria.fecha_inicio, 'yyyy-MM-dd'),
      fecha_fin: format(convocatoria.fecha_fin, 'yyyy-MM-dd'),
      id_tipoconvocatoria: parseInt(convocatoria.id_tipoconvocatoria),
      pago_mensual: parseInt(convocatoria.pago_mensual) || 0,
      id_programa: convocatoria.id_programa?.trim()
    };

    await api.put(`/convocatorias/${id}`, payload);
    setSuccess('Convocatoria actualizada correctamente.');
    
    // Redirigir a la edición de materias después de 1.5 segundos
    setTimeout(() => {
      navigate(`/convocatoria-materias/${id}/materias`);
    }, 1500);

  } catch (error) {
    console.error('Error al actualizar:', error);
    setError(error.response?.data?.error || 'Error al actualizar la convocatoria.');
  } finally {
    setLoading(false);
  }
};

  return (
    <Container maxWidth="md">
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h5" align="center" gutterBottom>
            Editar Convocatoria
          </Typography>

          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Nombre de la Convocatoria"
                  name="nombre"
                  value={convocatoria.nombre}
                  fullWidth
                  multiline
                  InputProps={{ readOnly: true }}
                  rows={3}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <StaticDatePicker
                    value={convocatoria.fecha_inicio}
                    onChange={handleDateInicioChange}
                    displayStaticWrapperAs="desktop"
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <StaticDatePicker
                    value={convocatoria.fecha_fin}
                    readOnly
                    displayStaticWrapperAs="desktop"
                    slotProps={{
                      textField: { fullWidth: true, InputProps: { readOnly: true } }
                    }}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Tipo de Convocatoria</InputLabel>
                  <Select
                    name="id_tipoconvocatoria"
                    value={convocatoria.id_tipoconvocatoria}
                    onChange={handleChange}
                    required
                  >
                    {tiposConvocatoria.map(tipo => (
                      <MenuItem key={tipo.id_tipoconvocatoria} value={tipo.id_tipoconvocatoria}>
                        {tipo.nombre_convocatoria}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Programa</InputLabel>
                  <Select
                    name="id_programa"
                    value={convocatoria.id_programa}
                    onChange={handleChange}
                    required
                  >
                    {carrerasFiltradas.map(p => (
                      <MenuItem key={p.id_programa} value={p.id_programa}>
                        {p.programa || p.nombre_carrera}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Resolución"
                  name="resolucion"
                  value={convocatoria.resolucion}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Dictamen"
                  name="dictamen"
                  value={convocatoria.dictamen}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Perfil Profesional"
                  name="perfil_profesional"
                  value={convocatoria.perfil_profesional}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={3}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Tipo de Jornada</InputLabel>
                  <Select
                    name="tipo_jornada"
                    value={convocatoria.tipo_jornada}
                    onChange={handleChange}
                  >
                    <MenuItem value="TIEMPO COMPLETO">Tiempo Completo</MenuItem>
                    <MenuItem value="TIEMPO HORARIO">Tiempo Horario</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Etapa</InputLabel>
                  <Select
                    name="etapa_convocatoria"
                    value={convocatoria.etapa_convocatoria}
                    onChange={handleChange}
                  >
                    <MenuItem value="PRIMERA">Primera</MenuItem>
                    <MenuItem value="SEGUNDA">Segunda</MenuItem>
                    <MenuItem value="TERCERA">Tercera</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Gestión</InputLabel>
                  <Select
                    name="gestion"
                    value={convocatoria.gestion}
                    onChange={handleChange}
                  >
                    <MenuItem value="GESTION 1">Gestión 1</MenuItem>
                    <MenuItem value="GESTION 2">Gestión 2</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Pago Mensual (Bs)"
                  name="pago_mensual"
                  type="number"
                  value={convocatoria.pago_mensual}
                  onChange={handleChange}
                  fullWidth
                  inputProps={{ min: 0 }}
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    size="large"
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Actualizar'}
                  </Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ConvocatoriaEdit;
