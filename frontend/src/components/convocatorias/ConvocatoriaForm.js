// frontend/src/components/convocatorias/ConvocatoriaForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Container, TextField, MenuItem, Button, Grid, 
  Typography, Card, CardContent, Alert, FormControl, 
  InputLabel, Select 
} from '@mui/material';
import { StaticDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, parseISO } from 'date-fns';

const ConvocatoriaForm = () => {
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
        const userResponse = await axios.get('http://localhost:5000/usuarios/me', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        const userData = userResponse.data;
        console.log('Datos del usuario:', userData);

        if (!userData.id_facultad) {
          throw new Error('El usuario no tiene facultad asignada');
        }

        setNombreFacultad(userData.nombre_facultad || '');
        
        const [tiposResponse, carrerasResponse] = await Promise.all([
          axios.get('http://localhost:5000/tipos-convocatorias'),
          axios.get(`http://localhost:5000/carreras/facultad-id/${userData.id_facultad}`)
        ]);

        setTiposConvocatoria(tiposResponse.data);
        setCarrerasFiltradas(carrerasResponse.data);

        if (id) {
          const response = await axios.get(`http://localhost:5000/convocatorias/${id}`);
          const data = response.data;
          setConvocatoria({
            ...data,
            nombre: data.nombre_conv || '',
            fecha_inicio: data.fecha_inicio ? parseISO(data.fecha_inicio) : new Date(),
            fecha_fin: data.fecha_fin ? parseISO(data.fecha_fin) : null,
            id_programa: data.id_programa?.trim() || userData.id_programa?.trim()
          });
          
          // Encontrar el programa seleccionado para mostrar su nombre
          const programa = carrerasResponse.data.find(p => p.id_programa === data.id_programa);
          if (programa) {
            setProgramaSeleccionado(programa.programa || programa.nombre_carrera);
          }
        } else {
          // Establecer programa del usuario para nuevas convocatorias
          setConvocatoria(prev => ({
            ...prev,
            id_programa: userData.id_programa?.trim() || ''
          }));
          
          // Encontrar el programa del usuario para mostrar su nombre
          const programa = carrerasResponse.data.find(p => p.id_programa === userData.id_programa?.trim());
          if (programa) {
            setProgramaSeleccionado(programa.programa || programa.nombre_carrera);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(`Error al cargar datos: ${error.response?.data?.error || error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Generar título automático cuando cambian los campos relevantes
  useEffect(() => {
    if (tiposConvocatoria.length > 0 && convocatoria.id_tipoconvocatoria && programaSeleccionado && convocatoria.etapa_convocatoria) {
      const tipoSeleccionado = tiposConvocatoria.find(t => t.id_tipoconvocatoria == convocatoria.id_tipoconvocatoria);
      if (tipoSeleccionado) {
        const nuevoNombre = `CONVOCATORIA ${tipoSeleccionado.nombre_tipo_conv || tipoSeleccionado.nombre_convocatoria} - ${programaSeleccionado} - ${convocatoria.etapa_convocatoria} ETAPA`;
        setConvocatoria(prev => ({ ...prev, nombre: nuevoNombre }));
      }
    }
  }, [convocatoria.id_tipoconvocatoria, programaSeleccionado, convocatoria.etapa_convocatoria, tiposConvocatoria]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConvocatoria(prev => ({
      ...prev,
      [name]: value
    }));

    // Actualizar programa seleccionado cuando cambia
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
      
      // Preparar payload para el backend
      const payload = {
        ...convocatoria,
        nombre_conv: convocatoria.nombre, // Asegurar compatibilidad con backend
        fecha_inicio: format(convocatoria.fecha_inicio, 'yyyy-MM-dd'),
        fecha_fin: format(convocatoria.fecha_fin, 'yyyy-MM-dd'),
        id_tipoconvocatoria: parseInt(convocatoria.id_tipoconvocatoria),
        pago_mensual: parseInt(convocatoria.pago_mensual) || 0,
        id_programa: convocatoria.id_programa.toString().trim()
      };

      if (id) {
        await axios.put(`http://localhost:5000/convocatorias/${id}`, payload);
        setSuccess('Convocatoria actualizada exitosamente');
        setTimeout(() => navigate('/convocatorias'), 2000);
      } else {
        const response = await axios.post('http://localhost:5000/convocatorias', payload);
        const newId = response.data.id_convocatoria;
        setSuccess('Convocatoria creada exitosamente');
        navigate(`/convocatorias/${newId}/materias`);
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Card style={{ borderRadius: '15px', backgroundColor: '#E3F2FD' }}>
        <CardContent>
          <Typography variant="h5" align="center" gutterBottom>
            {id ? 'Editar' : 'Registrar'} Convocatoria
          </Typography>
          
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
          
          <form onSubmit={handleSubmit}>
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

              {/* Nombre de la Convocatoria (generado automáticamente pero editable) */}
              <Grid item xs={12}>
                <TextField
                  label="Nombre de la Convocatoria"
                  name="nombre"
                  value={convocatoria.nombre}
                  onChange={handleChange}
                  fullWidth
                  required
                  InputProps={{
                    style: {
                      backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    },
                  }}
                  helperText="Este campo se llena automáticamente pero puede editarlo si lo desea"
                />
              </Grid>

              {/* Fechas con StaticDatePicker (calendarios grandes) */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Fecha de Inicio (Generación)
                </Typography>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <StaticDatePicker
                    displayStaticWrapperAs="desktop"
                    label="Fecha de Inicio"
                    value={convocatoria.fecha_inicio}
                    onChange={() => {}} 
                    readOnly
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        fullWidth 
                        InputProps={{ ...params.InputProps, readOnly: true }}
                      />
                    )}
                  />
                </LocalizationProvider>
                <Typography variant="caption" display="block" gutterBottom>
                  La fecha de inicio se establece automáticamente al crear la convocatoria
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Fecha de Conclusión
                </Typography>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <StaticDatePicker
                    displayStaticWrapperAs="desktop"
                    label="Fecha de Fin*"
                    value={convocatoria.fecha_fin}
                    onChange={handleDateChange}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>

              {/* Facultad y Programa */}
              <Grid item xs={6}>
                <TextField
                  label="Facultad"
                  fullWidth
                  value={nombreFacultad}
                  InputProps={{ readOnly: true }}
                />
              </Grid>

              <Grid item xs={6}>
                <FormControl fullWidth required>
                  <InputLabel>Programa</InputLabel>
                  <Select
                    name="id_programa"
                    value={convocatoria.id_programa}
                    onChange={handleChange}
                    label="Programa"
                    disabled={!!id}
                  >
                    {carrerasFiltradas.map((programa) => (
                      <MenuItem key={programa.id_programa} value={programa.id_programa}>
                        {programa.programa || programa.nombre_carrera}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Resto del formulario (igual que antes) */}
              <Grid item xs={6}>
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

              <Grid item xs={6}>
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

              <Grid item xs={6}>
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
              
              <Grid item xs={6}>
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

              <Grid item xs={12} align="center">
                <Button 
                  variant="contained" 
                  color="primary" 
                  type="submit" 
                  size="large"
                  disabled={loading}
                >
                  {loading ? 'Procesando...' : (id ? 'Actualizar' : 'Crear Convocatoria')}
                </Button>
                <Button 
                  variant="outlined" 
                  color="secondary" 
                  onClick={() => navigate('/convocatorias')} 
                  style={{ marginLeft: '10px' }}
                  size="large"
                >
                  Cancelar
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ConvocatoriaForm;