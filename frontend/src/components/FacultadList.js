// frontend/src/components/FacultadList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Container, Typography, Grid, Card, CardContent, Avatar, Divider, Skeleton, useTheme, useMediaQuery, Chip } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[6]
  }
}));

const FacultadList = ({ isOpen }) => {
  const [facultades, setFacultades] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchFacultades = async () => {
      try {
        const response = await axios.get('http://localhost:5000/facultades');
        setFacultades(response.data);
      } catch (error) {
        console.error('Error al obtener las facultades:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFacultades();
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
            Lista de Facultades
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" color="text.secondary">
            Explora las facultades disponibles en nuestra universidad
          </Typography>
        </Box>

        {loading ? (
          <Grid container spacing={3}>
            {[...Array(6)].map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Skeleton variant="rectangular" height={180} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Grid container spacing={3}>
            {facultades.map((facultad) => (
              <Grid item xs={12} sm={6} md={4} key={facultad.id_facultad}>
                <StyledCard>
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
                          bgcolor: theme.palette.secondary.main,
                          mr: 2
                        }}
                      >
                        <SchoolIcon />
                      </Avatar>
                      <Typography variant="h6" component="h2">
                        {facultad.nombre_facultad}
                      </Typography>
                    </Box>

                    {facultad.nombre_decano && (
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        mt: 2,
                        p: 1,
                        backgroundColor: theme.palette.grey[100],
                        borderRadius: 1
                      }}>
                        <PersonIcon 
                          fontSize="small" 
                          color="action" 
                          sx={{ mr: 1 }} 
                        />
                        <Typography variant="body2">
                          <strong>Decano:</strong> {facultad.nombre_decano}
                        </Typography>
                      </Box>
                    )}

                    <Box sx={{ mt: 2 }}>
                      <Chip
                        label={`ID: ${facultad.id_facultad}`}
                        color="primary"
                        size="small"
                        sx={{ mr: 1 }}
                      />
                    </Box>
                  </CardContent>
                </StyledCard>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default FacultadList;