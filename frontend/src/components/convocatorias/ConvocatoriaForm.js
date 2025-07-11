// frontend/src/components/convocatorias/ConvocatoriaForm.js
import React, { useState, useEffect } from 'react';
import api from '../../config/axiosConfig'; 
import { useNavigate, useParams } from 'react-router-dom';
import { Divider, Box, Container, TextField, MenuItem, Button, Grid, Typography, Card, CardContent, Alert, FormControl, InputLabel, Select, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { StaticDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, parseISO } from 'date-fns';
import { addDays } from 'date-fns';


const ConvocatoriaForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
const isMobile = useMediaQuery(theme.breakpoints.down('sm'));


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
    pago_mensual: 0
  });

  const [tiposConvocatoria, setTiposConvocatoria] = useState([]);
  const [carrerasFiltradas, setCarrerasFiltradas] = useState([]);
  const [nombreFacultad, setNombreFacultad] = useState('');
  const [programaSeleccionado, setProgramaSeleccionado] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Obtener datos del usuario (token ya se añade automáticamente en el interceptor)
        const userResponse = await api.get('/usuarios/me');
        const userData = userResponse.data;

        if (!userData.id_facultad) {
          throw new Error('El usuario no tiene facultad asignada');
        }

        // Obtener tipos de convocatoria y carreras filtradas por facultad
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

        // Establecer nombre de facultad (prioriza datos de carreras, sino usuario)
        if (carreras.length > 0 && carreras[0].facultad) {
          setNombreFacultad(carreras[0].facultad);
        } else if (userData.nombre_facultad) {
          setNombreFacultad(userData.nombre_facultad);
        }

        if (id) {
          // Si es edición, traer la convocatoria
          const response = await api.get(`/convocatorias/${id}`);
          const data = response.data;
          setConvocatoria({
            ...data,
            nombre: data.nombre_conv || '',
            fecha_inicio: data.fecha_inicio ? parseISO(data.fecha_inicio) : new Date(),
            fecha_fin: data.fecha_fin ? parseISO(data.fecha_fin) : null,
            id_programa: data.id_programa?.trim() || userData.id_programa?.trim()
          });

          const programa = carreras.find(p => p.id_programa === data.id_programa?.trim());
          if (programa) {
            setProgramaSeleccionado(programa.programa || programa.nombre_carrera);
          }
        } else {
          // Nuevo registro, establecer programa por defecto del usuario
          const userPrograma = userData.id_programa?.trim() || '';
          setConvocatoria(prev => ({
            ...prev,
            id_programa: userPrograma
          }));

          const programa = carreras.find(p => p.id_programa === userPrograma);
          if (programa) {
            setProgramaSeleccionado(programa.programa || programa.nombre_carrera);
          }
        }
      } catch (error) {
        console.error('Error completo:', error);
        setError(`Error al cargar datos: ${error.response?.data?.error || error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleDateInicioChange = (date) => {
  setConvocatoria(prev => ({
    ...prev,
    fecha_inicio: date,
    fecha_fin: addDays(date, 10) // calcula automáticamente 10 días después
  }));
};

  useEffect(() => {
    const year = new Date().getFullYear();
    let nuevoNombre = '';

    if (convocatoria.etapa_convocatoria) {
      nuevoNombre += `${convocatoria.etapa_convocatoria} `;
    }

    nuevoNombre += 'CONVOCATORIA ';

    if (convocatoria.id_tipoconvocatoria && tiposConvocatoria.length > 0) {
      const tipoSeleccionado = tiposConvocatoria.find(t =>
        t.id_tipoconvocatoria.toString() === convocatoria.id_tipoconvocatoria.toString()
      );

      const tipoNombre = tipoSeleccionado?.nombre_tipo_conv?.toUpperCase() || '';

      if (tipoNombre.includes('EXTRAORDINARIO')) {
        nuevoNombre += 'A CONCURSO DE MERITOS PARA LA PROVISION DE DOCENTE EXTRAORDINARIO EN CALIDAD DE INTERINO ';
      } else if (tipoNombre.includes('ORDINARIO')) {
        nuevoNombre += 'A CONCURSO DE MERITOS Y EXAMENES DE COMPETENCIA PARA LA PROVISIÓN DE DOCENTE ORDINARIO ';
      } else if (tipoNombre.includes('CONSULTORES')) {
        nuevoNombre += 'A CONCURSO DE MERITOS PARA LA CONTRATACION DE DOCENTES EN CALIDAD DE CONSULTORES DE LÍNEA ';
      } else if (tipoNombre) {
        nuevoNombre += `${tipoNombre} `;
      }
    }

    if (convocatoria.tipo_jornada) {
      nuevoNombre += `A ${convocatoria.tipo_jornada} `;
    }
    if (programaSeleccionado) {
      nuevoNombre += `PARA LA CARRERA DE ${programaSeleccionado} `;
    }

    if (convocatoria.id_tipoconvocatoria && tiposConvocatoria.length > 0) {
      const tipoSeleccionado = tiposConvocatoria.find(t =>
        t.id_tipoconvocatoria.toString() === convocatoria.id_tipoconvocatoria.toString()
      );
      const tipoNombre = tipoSeleccionado?.nombre_tipo_conv?.toUpperCase() || '';

      if (tipoNombre.includes('EXTRAORDINARIO')) {
        nuevoNombre += `SOLO POR LA GESTIÓN ACADÉMICA ${year}`;
      } else {
        nuevoNombre += `- GESTION ${year}`;
      }
    }

    setConvocatoria(prev => ({ ...prev, nombre: nuevoNombre.trim() }));
  }, [convocatoria.id_tipoconvocatoria, programaSeleccionado, convocatoria.etapa_convocatoria, convocatoria.tipo_jornada, tiposConvocatoria]);

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

  const handleDateChange = (date) => {
    setConvocatoria(prev => ({
      ...prev,
      fecha_fin: date
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      setLoading(true);

      if (!convocatoria.id_tipoconvocatoria || !convocatoria.id_programa || !convocatoria.fecha_fin) {
        throw new Error('Por favor complete todos los campos requeridos');
      }

      if (convocatoria.fecha_fin <= convocatoria.fecha_inicio) {
        throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
      }

      const payload = {
        ...convocatoria,
        nombre_conv: convocatoria.nombre,
        fecha_inicio: format(convocatoria.fecha_inicio, 'yyyy-MM-dd'),
        fecha_fin: format(convocatoria.fecha_fin, 'yyyy-MM-dd'),
        id_tipoconvocatoria: parseInt(convocatoria.id_tipoconvocatoria),
        pago_mensual: parseInt(convocatoria.pago_mensual) || 0,
        id_programa: convocatoria.id_programa.toString().trim()
      };

      if (id) {
        await api.put(`/convocatorias/${id}`, payload);
        setSuccess('Convocatoria actualizada exitosamente');
        setTimeout(() => navigate('/convocatorias'), 2000);
      } else {
        const response = await api.post('/convocatorias', payload);
        const newId = response.data.id_convocatoria;
        setSuccess('Convocatoria creada exitosamente');
        navigate(`/convocatoria-materias/${newId}/materias`);
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };

 return (
  <Container maxWidth="md">
    <Card sx={{
    borderRadius: 3,
    backgroundColor: '#ffffff',
    mt: 4,
    boxShadow: '0 3px 10px rgba(0,0,0,0.1)'
  }}
>
      <CardContent>
        <Typography variant="h5" align="center" gutterBottom>
          {id ? 'Editar' : 'Registrar'} Convocatoria
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

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
                      {tipo.nombre_tipo_conv || tipo.nombre_convocatoria}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Nombre automático */}
            <Grid item xs={12}>
              <TextField
                label="Nombre de la Convocatoria"
                name="nombre"
                value={convocatoria.nombre || ''}
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
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Fechas
              </Typography>
            </Grid>
            {/* Fechas */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Fecha de Publicación
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <StaticDatePicker
                  value={convocatoria.fecha_inicio}
                  onChange={handleDateInicioChange}
                  displayStaticWrapperAs={isMobile ? 'mobile' : 'desktop'}
                  slotProps={{
                    textField: {
                      fullWidth: true
                    }
                  }}
                />
              </LocalizationProvider>
              <Typography variant="caption" display="block">
                Puedes seleccionar la fecha en que se publicará la convocatoria
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Fecha de Finalizacion de la Convocatoria
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <StaticDatePicker
                  value={convocatoria.fecha_fin}
                  readOnly
                  displayStaticWrapperAs={isMobile ? 'mobile' : 'desktop'}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      InputProps: { readOnly: true }
                    }
                  }}
                />
              </LocalizationProvider>
              <Typography variant="caption" display="block">
                Esta fecha se calcula automáticamente 10 días después de la fecha de publicación
              </Typography>
            </Grid>

            {/* Facultad y Programa */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Facultad"
                value={nombreFacultad}
                fullWidth
                InputProps={{ readOnly: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Programa</InputLabel>
                <Select
                  name="id_programa"
                  value={convocatoria.id_programa?.trim() || ''}
                  onChange={handleChange}
                  label="Programa"
                  disabled={!!id}
                >
                  {carrerasFiltradas.map((p) => (
                    <MenuItem key={p.id_programa} value={p.id_programa?.trim()}>
                      {p.programa || p.nombre_carrera}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Tipo de Jornada y Etapa */}
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

            {/* Gestión y Pago */}
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

            {/* Resolución y Dictamen */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Resolución"
                name="resolucion"
                value={convocatoria.resolucion}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Dictamen"
                name="dictamen"
                value={convocatoria.dictamen}
                onChange={handleChange}
                fullWidth
                required
              />
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
                {loading ? 'Procesando...' : (id ? 'Actualizar' : 'Siguiente')}
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

export default ConvocatoriaForm;
