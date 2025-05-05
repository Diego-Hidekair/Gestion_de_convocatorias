// frontend/src/components/convocatorias/ConvocatoriaForm.js
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, TextField, MenuItem, Button, Grid, Typography, Card, CardContent, Box } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import AuthContext from '../../context/AuthContext';

const ConvocatoriaForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    tipo_jornada: 'TIEMPO COMPLETO',
    fecha_fin: null,
    id_tipoconvocatoria: '',
    etapa_convocatoria: 'PRIMERA',
    pago_mensual: 0,
    resolucion: '',
    dictamen: '',
    perfil_profesional: '',
    gestion: 'GESTION 1',
    materias: []
  });

  const [tiposConvocatoria, setTiposConvocatoria] = useState([]);
  const [programas, setProgramas] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tiposResponse] = await Promise.all([
          axios.get('/tipos-convocatorias'),
        ]);
        
        setTiposConvocatoria(tiposResponse.data);
        
        if (id) {
          const convocatoriaResponse = await axios.get(`/convocatorias/${id}`);
          setFormData(convocatoriaResponse.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    fetchData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await axios.put(`/convocatorias/${id}`, formData);
      } else {
        const response = await axios.post('/convocatorias', formData);
        navigate(`/convocatorias/${response.data.id_convocatoria}/materias`);
      }
    } catch (error) {
      console.error('Error saving convocatoria:', error);
    }
  };

  return (
    <Container maxWidth="md">
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {id ? 'Editar' : 'Nueva'} Convocatoria
          </Typography>
          
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  label="Tipo de Convocatoria"
                  fullWidth
                  value={formData.id_tipoconvocatoria}
                  onChange={(e) => setFormData({...formData, id_tipoconvocatoria: e.target.value})}
                  required
                >
                  {tiposConvocatoria.map((tipo) => (
                    <MenuItem key={tipo.id_tipoconvocatoria} value={tipo.id_tipoconvocatoria}>
                      {tipo.nombre_tipo_conv}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              {/* Resto de campos del formulario */}
              
              <Grid item xs={12}>
                <Box display="flex" justifyContent="flex-end" gap={2}>
                  <Button variant="outlined" onClick={() => navigate('/convocatorias')}>
                    Cancelar
                  </Button>
                  <Button type="submit" variant="contained" color="primary">
                    {id ? 'Actualizar' : 'Guardar'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ConvocatoriaForm;