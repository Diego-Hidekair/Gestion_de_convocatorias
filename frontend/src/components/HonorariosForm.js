import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, TextField, Button, Paper, Container, useTheme, CircularProgress, Alert, Grid} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

const HonorariosForm = () => {
  const location = useLocation();
  const id_materia = location.state?.id_materia || null;
  const { id_convocatoria, id_honorario } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();

  const [formData, setFormData] = useState({
    pagoMensual: '',
    resolucion: '',
    dictamen: ''
  });
  const [nombreConvocatoria, setNombreConvocatoria] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id_honorario) {
      const fetchHonorario = async () => {
        try {
          const response = await axios.get(`http://localhost:5000/honorarios/${id_honorario}`);
          const honorario = response.data;
          setFormData({
            pagoMensual: honorario.pago_mensual,
            resolucion: honorario.resolucion,
            dictamen: honorario.dictamen
          });
        } catch (err) {
          setError('Error al obtener el honorario.');
        }
      };
      fetchHonorario();
    }
  }, [id_honorario]);

  useEffect(() => {
    localStorage.setItem('currentPage', `/honorarios/new/${id_convocatoria}/${id_materia}`);

    const fetchNombreConvocatoria = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/convocatorias/${id_convocatoria}`);
        setNombreConvocatoria(response.data.nombre_tipoconvocatoria);
      } catch (err) {
        setError('Error al obtener el tipo de convocatoria.');
      }
    };

    fetchNombreConvocatoria();
  }, [id_convocatoria, id_materia]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!id_convocatoria) {
      setError('No se ha seleccionado una convocatoria.');
      setLoading(false);
      return;
    }

    try {
      if (id_honorario) {
        // Modo edición
        await axios.put(`http://localhost:5000/honorarios/${id_honorario}`, {
          pago_mensual: formData.pagoMensual,
          resolucion: formData.resolucion,
          dictamen: formData.dictamen
        });
        navigate(`/convocatorias_materias/edit/${id_convocatoria}/${id_materia}`, {
          state: { message: 'Honorario actualizado correctamente' }
        });
      } else {
        // Modo creación
        const response = await axios.post('http://localhost:5000/honorarios', {
          id_convocatoria,
          pago_mensual: formData.pagoMensual,
          resolucion: formData.resolucion,
          dictamen: formData.dictamen
        });
        const { id_honorario: newIdHonorario } = response.data;
        navigate(`/pdf/generar/${id_convocatoria}/${newIdHonorario}`);
      }
    } catch (error) {
      console.error('Error creando/actualizando honorario:', error);
      setError('Error creando/actualizando el honorario');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (id_materia) {
      navigate(`/convocatorias_materias/edit/${id_convocatoria}/${id_materia}`);
    } else if (id_convocatoria) {
      navigate(`/convocatorias_materias/edit/${id_convocatoria}`);
    }
  };

  const handleCancel = () => {
    localStorage.removeItem('currentPage');
    navigate('/');
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom textAlign="center">
          {id_honorario ? 'Editar' : 'Crear'} Honorario
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" textAlign="center" sx={{ mb: 2 }}>
                Tipo de Convocatoria: {nombreConvocatoria}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Pago Mensual"
                name="pagoMensual"
                type="number"
                value={formData.pagoMensual}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Resolución"
                name="resolucion"
                value={formData.resolucion}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Dictamen"
                name="dictamen"
                value={formData.dictamen}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<ArrowBackIcon />}
                onClick={handleBack}
              >
                Volver
              </Button>
              <Box>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={handleCancel}
                  sx={{ mr: 2 }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : id_honorario ? 'Actualizar' : 'Siguiente'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default HonorariosForm;