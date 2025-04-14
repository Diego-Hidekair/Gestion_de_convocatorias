// frontend/src/components/CarreraList.js 
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Container, Typography, Grid, Card, CardContent, Chip, Avatar, Divider, Skeleton, useTheme, useMediaQuery} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';

const CarreraList = ({ isOpen }) => {
  const [carreras, setCarreras] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchCarreras = async () => {
      try {
        const response = await axios.get('http://localhost:5000/carreras');
        setCarreras(response.data);
      } catch (error) {
        console.error('Error al obtener las carreras:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCarreras();
  }, []);

  return (
    <Box
      sx={{
        ml: isOpen ? { xs: 0, sm: 28 } : { xs: 0, sm: 10 },
        transition: theme.transitions.create(['margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        p: 3,
        width: '100%'
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Lista de Carreras
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" color="text.secondary">
            Carreras por las que se compone la UniversidadAutónoma Tomás Frías
          </Typography>
        </Box>

        {loading ? (
          <Grid container spacing={3}>
            {[...Array(6)].map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Skeleton variant="rectangular" height={150} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Grid container spacing={3}>
            {carreras.map((carrera) => (
              <Grid item xs={12} sm={6} md={4} key={carrera.id_programa}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: theme.shadows[6]
                    }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: 2
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: theme.palette.primary.main,
                          mr: 2
                        }}
                      >
                        <SchoolIcon />
                      </Avatar>
                      <Typography variant="h6" component="h2">
                        {carrera.programa}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                      <CorporateFareIcon
                        fontSize="small"
                        color="action"
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {carrera.nombre_facultad}
                      </Typography>
                    </Box>

                    <Box sx={{ mt: 2 }}>
                      <Chip
                        label={carrera.id_programa}
                        color="secondary"
                        size="small"
                        sx={{ mr: 1 }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default CarreraList;