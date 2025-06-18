// src/components/TipoconvocatoriaList.js 
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, Button, Grid, Card, CardContent, IconButton, Container, useTheme, Paper, CircularProgress, Alert} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';

const TipoconvocatoriaList = ({ isOpen }) => {
  const [tiposConvocatoria, setTiposConvocatoria] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTiposConvocatoria = async () => {
      try {
        const response = await axios.get('http://localhost:5000/tipos-convocatorias');
        setTiposConvocatoria(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error al obtener los tipos de convocatoria:', error);
        setError('Error al cargar los tipos de convocatoria');
        setLoading(false);
      }
    };
    fetchTiposConvocatoria();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro que desea eliminar este tipo de convocatoria?')) return;
    
    try {
      await axios.delete(`http://localhost:5000/tipos-convocatorias/${id}`);
      setTiposConvocatoria(tiposConvocatoria.filter(tipo => tipo.id_tipoconvocatoria !== id));
    } catch (error) {
      console.error('Error al eliminar el tipo de convocatoria:', error);
      setError('Error al eliminar el tipo de convocatoria');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box m={2}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        ml: isOpen ? '240px' : '0px',
        transition: theme.transitions.create('margin', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        p: 3,
        width: isOpen ? 'calc(100% - 240px)' : '100%'
      }}
    >
      <Paper elevation={3} sx={{ p: 3, mb: 3, backgroundColor: theme.palette.primary.main }}>
        <Typography variant="h4" component="h1" sx={{ color: 'white', textAlign: 'center' }}>
          Lista de Tipos de Convocatoria
        </Typography>
      </Paper>

      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/tipos-convocatorias/crear')}
            sx={{ mb: 2 }}
          >
            Crear Nuevo Tipo de Convocatoria
          </Button>
        </Box>

        <Grid container spacing={3}>
          {tiposConvocatoria.map((tipo) => (
            <Grid item xs={12} sm={6} md={4} key={tipo.id_tipoconvocatoria}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h2" textAlign="center">
                    {tipo.nombre_convocatoria}
                  </Typography>
                </CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-around', p: 1 }}>
                  <Button
                    variant="contained"
                    color="warning"
                    startIcon={<EditIcon />}
                    onClick={() => navigate(`/tipos-convocatorias/editar/${tipo.id_tipoconvocatoria}`)}
                    size="small"
                  >
                    Editar
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDelete(tipo.id_tipoconvocatoria)}
                    size="small"
                  >
                    Eliminar
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default TipoconvocatoriaList;