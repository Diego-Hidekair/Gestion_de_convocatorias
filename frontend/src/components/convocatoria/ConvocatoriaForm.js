// frontend/src/components/Convocatoria/ConvocatoriaForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, TextField, MenuItem, Button, Grid, Typography, Card, CardContent, FormControl, InputLabel, Select } from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import axios from 'axios';
import useAuth from '../../hooks/useAuth';

const ConvocatoriaForm = ({ initialData, onSubmit }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    tipo_jornada: 'TIEMPO COMPLETO',
    fecha_fin: null,
    id_tipoconvocatoria: '',
    etapa_convocatoria: 'PRIMERA',
    pago_mensual: 0,
    gestion: 'GESTION 1',
    resolucion: '',
    dictamen: '',
    perfil_profesional: '',
    materias: []
  });

  const [tiposConvocatoria, setTiposConvocatoria] = useState([]);
  const [materiasDisponibles, setMateriasDisponibles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tiposResponse, materiasResponse] = await Promise.all([
          axios.get('/tipos-convocatorias'),
          axios.get(`/materias/programa/${user.id_programa}`)
        ]);

        setTiposConvocatoria(tiposResponse.data);
        setMateriasDisponibles(materiasResponse.data);

        if (id && initialData) {
          setFormData({
            ...initialData,
            fecha_fin: initialData.fecha_fin ? parseISO(initialData.fecha_fin) : null
          });
        }

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [id, initialData, user.id_programa]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      fecha_fin: date
    }));
  };

  const handleMateriasChange = (selectedMaterias) => {
    setFormData(prev => ({
      ...prev,
      materias: selectedMaterias
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const dataToSubmit = {
      ...formData,
      fecha_fin: format(formData.fecha_fin, 'yyyy-MM-dd'),
      id_programa: user.id_programa
    };

    onSubmit(dataToSubmit);
  };

  if (loading) {
    return (
      <Container>
        <Typography>Cargando...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Card elevation={3} style={{ marginTop: '20px', borderRadius: '15px' }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {id ? 'Editar' : 'Crear'} Convocatoria
          </Typography>
          
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="tipo-convocatoria-label">Tipo de Convocatoria</InputLabel>
                  <Select
                    labelId="tipo-convocatoria-label"
                    label="Tipo de Convocatoria"
                    name="id_tipoconvocatoria"
                    value={formData.id_tipoconvocatoria}
                    onChange={handleChange}
                    required
                  >
                    {tiposConvocatoria.map(tipo => (
                      <MenuItem key={tipo.id_tipoconvocatoria} value={tipo.id_tipoconvocatoria}>
                        {tipo.nombre_tipo_conv}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="jornada-label">Tipo de Jornada</InputLabel>
                  <Select
                    labelId="jornada-label"
                    label="Tipo de Jornada"
                    name="tipo_jornada"
                    value={formData.tipo_jornada}
                    onChange={handleChange}
                    required
                  >
                    <MenuItem value="TIEMPO COMPLETO">Tiempo Completo</MenuItem>
                    <MenuItem value="TIEMPO HORARIO">Tiempo Horario</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns} locale={es}>
                  <DatePicker
                    label="Fecha de Fin"
                    value={formData.fecha_fin}
                    onChange={handleDateChange}
                    minDate={new Date()}
                    renderInput={(params) => <TextField {...params} fullWidth required />}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="etapa-label">Etapa de Convocatoria</InputLabel>
                  <Select
                    labelId="etapa-label"
                    label="Etapa de Convocatoria"
                    name="etapa_convocatoria"
                    value={formData.etapa_convocatoria}
                    onChange={handleChange}
                    required
                  >
                    <MenuItem value="PRIMERA">Primera</MenuItem>
                    <MenuItem value="SEGUNDA">Segunda</MenuItem>
                    <MenuItem value="TERCERA">Tercera</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Resolución"
                  name="resolucion"
                  value={formData.resolucion}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Dictamen"
                  name="dictamen"
                  value={formData.dictamen}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Perfil Profesional"
                  name="perfil_profesional"
                  value={formData.perfil_profesional}
                  onChange={handleChange}
                  multiline
                  rows={4}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Pago Mensual (Bs.)"
                  name="pago_mensual"
                  type="number"
                  value={formData.pago_mensual}
                  onChange={handleChange}
                  inputProps={{ min: 0 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="gestion-label">Gestión</InputLabel>
                  <Select
                    labelId="gestion-label"
                    label="Gestión"
                    name="gestion"
                    value={formData.gestion}
                    onChange={handleChange}
                    required
                  >
                    <MenuItem value="GESTION 1">Gestión 1</MenuItem>
                    <MenuItem value="GESTION 2">Gestión 2</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  size="large"
                >
                  {id ? 'Actualizar' : 'Crear'}
                </Button>
                <Button 
                  variant="outlined" 
                  color="secondary" 
                  onClick={() => navigate(-1)}
                  style={{ marginLeft: '10px' }}
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