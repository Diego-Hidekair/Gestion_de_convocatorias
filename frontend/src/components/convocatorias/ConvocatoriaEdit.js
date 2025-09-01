// frontend/src/components/ConvocatoriaEdit.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../config/axiosConfig';
import { Container, TextField, Button, Typography, Card, CardContent, Grid, Box, FormControl, InputLabel, Select, MenuItem, Alert, CircularProgress, Divider, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { LocalizationProvider, StaticDatePicker, DateTimePicker, TimePicker} from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, parseISO, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { InputAdornment } from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const ConvocatoriaEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [tipoEsConsultor, setTipoEsConsultor] = useState(false);
  const [nombreFacultad, setNombreFacultad] = useState('');
  const currentYear = new Date().getFullYear();

  const [convocatoria, setConvocatoria] = useState({
    nombre: '',
    fecha_inicio: new Date(),
    fecha_fin: null,
    id_tipoconvocatoria: '',
    id_programa: '',
    tipo_jornada: 'TIEMPO COMPLETO',
    etapa_convocatoria: 'PRIMERA',
    gestion: 'GESTION 1',
    resolucion: `/${new Date().getFullYear()}`,
    dictamen: `/${new Date().getFullYear()}`,
    perfil_profesional: '',
    pago_mensual: 0,
    apertura_sobres: null,
    plazo_presentacion_horas: null
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

        if (carreras.length > 0 && carreras[0].facultad) {
          setNombreFacultad(carreras[0].facultad);
        } else if (userData.nombre_facultad) {
          setNombreFacultad(userData.nombre_facultad);
        }

        if (id) {
          const response = await api.get(`/convocatorias/${id}`);
          const data = response.data;

          const fechaInicio = data.fecha_inicio ? parseISO(data.fecha_inicio) : new Date();
          const fechaFin = data.fecha_fin ? parseISO(data.fecha_fin) : addDays(fechaInicio, 8);

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
            apertura_sobres: data.apertura_sobres ? parseISO(data.apertura_sobres) : null,
            plazo_presentacion_horas: data.plazo_presentacion_horas ? 
              new Date(`1970-01-01T${data.plazo_presentacion_horas}`) : null
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

  const handleResolucionChange = (e) => {
    const value = e.target.value;
    const numero = value.split('/')[0] || '';
    setConvocatoria(prev => ({
      ...prev,
      resolucion: `${numero}/${currentYear}`
    }));
  };

  const handleDictamenChange = (e) => {
    const value = e.target.value;
    const numero = value.split('/')[0] || '';
    setConvocatoria(prev => ({
      ...prev,
      dictamen: `${numero}/${currentYear}`
    }));
  };

  const handleDateInicioChange = (date) => {
    setConvocatoria(prev => ({
      ...prev,
      fecha_inicio: date,
      fecha_fin: addDays(date, 8)
    }));
  };

  const handleAperturaSobresChange = (date) => {
  setConvocatoria(prev => ({
    ...prev,
    apertura_sobres: date
  }));
  setError(null);
};
  const handlePlazoPresentacionChange = (time) => {
    setConvocatoria(prev => ({
      ...prev,
      plazo_presentacion_horas: time
    }));
  };
  useEffect(() => {
    const tipoSeleccionado = tiposConvocatoria.find(
      t => t.id_tipoconvocatoria.toString() === convocatoria.id_tipoconvocatoria.toString()
    );
    const nombreTipo = tipoSeleccionado?.nombre_tipo_conv?.trim().toUpperCase() || '';
    setTipoEsConsultor(nombreTipo.includes('CONSULTORES'));
  }, [convocatoria.id_tipoconvocatoria, tiposConvocatoria]);

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
      nuevoNombre += `- ${convocatoria.gestion} ${year}`;
    }

    setConvocatoria(prev => ({ ...prev, nombre: nuevoNombre.trim() }));
  }, [convocatoria.id_tipoconvocatoria, programaSeleccionado, convocatoria.etapa_convocatoria, convocatoria.tipo_jornada, tiposConvocatoria, convocatoria.gestion]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

  try {
    setLoading(true);

    if (convocatoria.fecha_fin <= convocatoria.fecha_inicio) {
      throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
    }
    if (convocatoria.apertura_sobres && convocatoria.fecha_fin) {
      const fechaFinDate = new Date(convocatoria.fecha_fin);
      const aperturaDate = new Date(convocatoria.apertura_sobres);
      
      fechaFinDate.setHours(0, 0, 0, 0);
      aperturaDate.setHours(0, 0, 0, 0);
      
      if (aperturaDate < fechaFinDate) {
        throw new Error('La fecha de apertura de sobres no puede ser anterior al plazo final de la convocatoria');
      }
    }
    
    const tipoSeleccionado = tiposConvocatoria.find(
      t => t.id_tipoconvocatoria.toString() === convocatoria.id_tipoconvocatoria.toString()
    );
    const nombreTipo = tipoSeleccionado?.nombre_tipo_conv?.trim().toUpperCase() || '';

    if (nombreTipo.includes('CONSULTORES') && (!convocatoria.pago_mensual || convocatoria.pago_mensual <= 0)) {
      throw new Error('Debe ingresar un pago mensual válido para convocatorias de consultores de línea');
    }

    const payload = {
      ...convocatoria,
      nombre_conv: convocatoria.nombre,
      fecha_inicio: format(convocatoria.fecha_inicio, 'yyyy-MM-dd'),
      fecha_fin: format(convocatoria.fecha_fin, 'yyyy-MM-dd'),
      id_tipoconvocatoria: parseInt(convocatoria.id_tipoconvocatoria),
      pago_mensual: parseInt(convocatoria.pago_mensual) || 0,
      id_programa: convocatoria.id_programa?.trim(),
      resolucion: convocatoria.resolucion,
      dictamen: convocatoria.dictamen,
      apertura_sobres: convocatoria.apertura_sobres ? 
        format(convocatoria.apertura_sobres, "yyyy-MM-dd'T'HH:mm:ss") : null,
      plazo_presentacion_horas: convocatoria.plazo_presentacion_horas ? 
        format(convocatoria.plazo_presentacion_horas, 'HH:mm:ss') : null
    };

    console.log('Enviando payload:', payload);
    const response = await api.put(`/convocatorias/${id}`, payload);

    if (response.status === 200) {
      setSuccess('Convocatoria actualizada correctamente');
      setTimeout(() => {
        navigate(`/convocatoria-materias/${id}/materias`);
      }, 1500);
    } else {
      throw new Error(response.data?.message || 'Error al actualizar');
    }
  } catch (error) {
    console.error('Error completo:', error);
    console.error('Respuesta del servidor:', error.response?.data);
    setError(error.response?.data?.error || error.message || 'Error al actualizar la convocatoria');
  } finally {
    setLoading(false);
  }
};

 return (
    <Container maxWidth="md">
      <Card sx={{ borderRadius: 3, backgroundColor: '#fff', mt: 4, boxShadow: '0 3px 10px rgba(0,0,0,0.1)' }}>
        <CardContent>
          <Typography variant="h5" align="center" gutterBottom>
            Editar Convocatoria
          </Typography>

          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={2}>

              {/* Tipo de Convocatoria */}
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Tipo de Convocatoria</InputLabel>
                  <Select 
                    name="id_tipoconvocatoria" 
                    value={convocatoria.id_tipoconvocatoria} 
                    onChange={handleChange}
                    label="Tipo de Convocatoria"
                  >
                    {tiposConvocatoria.map((tipo) => (
                      <MenuItem key={tipo.id_tipoconvocatoria} value={tipo.id_tipoconvocatoria}>
                        {tipo.nombre_convocatoria}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Carrera y Gestión */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Carrera</InputLabel>
                  <Select 
                    name="id_programa" 
                    value={convocatoria.id_programa} 
                    onChange={handleChange}
                    label="Carrera"
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
                <FormControl fullWidth required>
                  <InputLabel>Gestión</InputLabel>
                  <Select
                    name="gestion"
                    value={convocatoria.gestion}
                    onChange={handleChange}
                    label="Gestión"
                  >
                    <MenuItem value="GESTION 1">Gestión 1</MenuItem>
                    <MenuItem value="GESTION 2">Gestión 2</MenuItem>
                    <MenuItem value="GESTION 1 Y 2">Gestión 1 y 2</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Nombre automático */}
              <Grid item xs={12}>
                <TextField
                  label="Nombre de la Convocatoria"
                  name="nombre"
                  value={convocatoria.nombre}
                  fullWidth
                  InputProps={{
                    readOnly: true,
                    style: { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
                  }}
                  multiline
                  rows={3}
                  helperText="El título se genera automáticamente al completar los campos"
                />
              </Grid>

              {/* Facultad y Tipo de Jornada */}
              <Grid item xs={12} md={6}>
                <TextField label="Facultad" value={nombreFacultad} fullWidth InputProps={{ readOnly: true }} />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Tipo de Jornada</InputLabel>
                  <Select
                    name="tipo_jornada"
                    value={convocatoria.tipo_jornada}
                    onChange={handleChange}
                    label="Tipo de Jornada"
                  >
                    <MenuItem value="TIEMPO COMPLETO">Tiempo Completo</MenuItem>
                    <MenuItem value="TIEMPO HORARIO">Tiempo Horario</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Etapa y Resolución */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Etapa</InputLabel>
                  <Select
                    name="etapa_convocatoria"
                    value={convocatoria.etapa_convocatoria}
                    onChange={handleChange}
                    label="Etapa"
                  >
                    <MenuItem value="PRIMERA">Primera</MenuItem>
                    <MenuItem value="SEGUNDA">Segunda</MenuItem>
                    <MenuItem value="TERCERA">Tercera</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Resolución Facultativa"
                  name="resolucion"
                  value={convocatoria.resolucion.split('/')[0]} 
                  onChange={handleResolucionChange} 
                  fullWidth
                  required
                  InputProps={{
                    endAdornment: <InputAdornment position="end">/{currentYear}</InputAdornment>,
                  }}
                />
              </Grid>
            
              {/* Dictamen y Pago (si es consultor) */}
              <Grid item xs={12} md={6}>
                <TextField
                  label="Dictamen de Carrera"
                  name="dictamen"
                  value={convocatoria.dictamen.split('/')[0]} 
                  onChange={handleDictamenChange} 
                  fullWidth
                  required
                  InputProps={{
                    endAdornment: <InputAdornment position="end">/{currentYear}</InputAdornment>,
                  }}
                />
              </Grid>

              {tipoEsConsultor && (
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
              )}

              {/* Fechas */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Fechas
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Fecha de Publicación
                </Typography>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                  <StaticDatePicker 
                    value={convocatoria.fecha_inicio} 
                    onChange={handleDateInicioChange} 
                    displayStaticWrapperAs={isMobile ? 'mobile' : 'desktop'} 
                    slotProps={{
                      actionBar: { actions: [] },
                      textField: { fullWidth: true } 
                    }} 
                  />
                </LocalizationProvider>
                <Typography variant="caption" display="block">
                  Puedes seleccionar la fecha en que se publicará la convocatoria
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Plazo final de la Convocatoria
                </Typography>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                  <StaticDatePicker 
                    value={convocatoria.fecha_fin} 
                    onChange={(date) => setConvocatoria(prev => ({ ...prev, fecha_fin: date }))} 
                    displayStaticWrapperAs={isMobile ? 'mobile' : 'desktop'} 
                    slotProps={{ 
                      textField: { fullWidth: true }
                    }}
                  />
                </LocalizationProvider>
                <Typography variant="caption" display="block">
                  Esta fecha se calcula automáticamente 8 días después de la fecha de publicación
                </Typography>
              </Grid>

              

              {/* Detalles Adicionales */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Detalles Adicionales
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                 <DateTimePicker
                  label="Fecha y Hora de Apertura de Sobres"
                  value={convocatoria.apertura_sobres}
                  onChange={handleAperturaSobresChange}
                  minDate={
                    convocatoria.fecha_fin
                      ? new Date(new Date(convocatoria.fecha_fin).setHours(0, 0, 0, 0))
                      : null
                  }
                  shouldDisableDate={(date) => {
                    if (!convocatoria.fecha_fin) return false;
                    const fechaFin = new Date(convocatoria.fecha_fin).setHours(0, 0, 0, 0);
                    return date < fechaFin; // deshabilita solo días anteriores
                  }}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      fullWidth 
                      error={error && error.includes('apertura de sobres')}
                      helperText={error && error.includes('apertura de sobres') ? error : ''}
                    />
                  )}
                  ampm={false}
                  inputFormat="dd/MM/yyyy HH:mm"
                  components={{
                    OpenPickerIcon: () => <EventIcon />,
                  }}
                />
                </LocalizationProvider>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Fecha y hora para la apertura de sobres de postulantes
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                  <TimePicker
                    label="Plazo de Presentación (Hora límite)"
                    value={convocatoria.plazo_presentacion_horas}
                    onChange={handlePlazoPresentacionChange}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                    components={{
                      OpenPickerIcon: () => <AccessTimeIcon />,
                    }}
                  />
                </LocalizationProvider>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Hora límite para presentación de documentos
                </Typography>
              </Grid>

              {/* Perfil Profesional */}
              <Grid item xs={12}>
                <TextField 
                  label="Perfil Profesional" 
                  name="perfil_profesional" 
                  value={convocatoria.perfil_profesional} 
                  onChange={handleChange} 
                  fullWidth 
                  multiline 
                  rows={4} 
                  required
                  placeholder="Ejemplo: Profesional en Ingeniería de Sistemas con especialización en..."
                  helperText="Describa los requisitos profesionales necesarios para el cargo"
                />
              </Grid>

              {/* Botones */}
              <Grid item xs={12} textAlign="center">
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  size="large"
                  fullWidth={isMobile}
                  sx={{ px: isMobile ? 0 : 4 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Actualizar'}
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => navigate('/convocatorias')}
                  size="large"
                  fullWidth={isMobile}
                  sx={{ ml: isMobile ? 0 : 2, mt: isMobile ? 2 : 0 }}
                >
                  Cancelar
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
