// frontend/src/components/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, Grid, CssBaseline, Avatar, Container, Link, Paper, AppBar, Toolbar} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { createTheme, ThemeProvider } from '@mui/material/styles';

axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const theme = createTheme({//diseño
  palette: { primary: { main: '#FF4E50', },
    secondary: { main: '#1976d2', }, background: { default: '#f5f5f5',},
  },
  components: { MuiButton: { styleOverrides: { root: {
          borderRadius: '25px',
          fontWeight: 'bold',
          padding: '10px 20px',
          textTransform: 'none',
          '&:hover': {
            backgroundColor: '#ff6b6b',
          },
        },
      },
    },
    MuiTextField: { styleOverrides: {
        root: { '& .MuiOutlinedInput-root': {
            borderRadius: '25px',
            backgroundColor: 'rgb(245, 245, 245)',
          },
        },
      },
    },
  },
});

const Login = ({ setAuth }) => {
  const [formData, setFormData] = useState({
    id_usuario: '',
    Contrasena: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        id_usuario: formData.id_usuario,
        contrasena: formData.Contrasena 
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const { token, userId, rol } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
      localStorage.setItem('rol', rol);
      
      setAuth(true);
      
      const redirectPaths = {
        'admin': '/usuarios',
        'personal_administrativo': '/solicitudes',
        'secretaria_de_decanatura': '/convocatorias',
        'tecnico_vicerrectorado': '/convocatorias',
        'vicerrectorado': '/reportes'
      };
      
      navigate(redirectPaths[rol] || '/perfil');
      
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      const errorMessage = error.response?.data?.error || 
                          (error.response?.status === 500 ? 
                           'Error en el servidor' : 
                           'Credenciales incorrectas');
      setError(errorMessage);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar 
        position="fixed"
        sx={{ 
          backgroundColor: '#c0c0c0',
          boxShadow: 'none',
          zIndex: (theme) => theme.zIndex.drawer + 1
        }}
      >
        <Toolbar>
          <Box
            component="img"
            src="/imagenes/LOG-fd8360d8.png"
            alt="Logo"
            sx={{ 
              width: '10rem',
              height: 'auto'
            }}
          />
        </Toolbar>
      </AppBar>
      <Container 
        maxWidth={false}
        sx={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f5f5f5',
          pt: '64px' 
        }}
      >
        <Paper
          elevation={3}
          sx={{
            display: 'flex',
            width: '80%',
            maxWidth: '900px',
            borderRadius: '10px',
            overflow: 'hidden'
          }}
        >
          <Box
            sx={{
              flex: 1,
              backgroundColor: 'white',
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3
              }}
            >
              <Avatar
                src="/imagenes/mini-logo.png" 
                sx={{
                  width: 160,
                  height: 80,
                  borderRadius: '1rem',
                  mr: 5,
                  backgroundColor: 'rgba(0,0,0,0.2)'
                }}
              />
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 'bold',
                  color: 'text.primary'
                }}
              >
                LOGIN
              </Typography>
            </Box>

            {error && (
              <Typography 
                color="error" 
                variant="body2" 
                sx={{ 
                  mb: 2,
                  textAlign: 'center'
                }}
              >
                {error}
              </Typography>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="id_usuario"
                label="ID de Usuario"
                name="id_usuario"
                autoComplete="username"
                autoFocus
                value={formData.id_usuario}
                onChange={handleChange}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="Contrasena"
                label="Contraseña"
                type="password"
                id="password"
                autoComplete="current-password"
                value={formData.Contrasena}
                onChange={handleChange}
                sx={{ mb: 2 }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                sx={{ mt: 3, mb: 2 }}
              >
                Ingresar
              </Button>
            </Box>
          </Box>

          <Box
            sx={{
              flex: 1,
              backgroundImage: 'url(/imagenes/universidad-fondo.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: { xs: 'none', md: 'block' }
            }}
          />
        </Paper>

        <Typography
          variant="body2"
          sx={{
            position: 'fixed',
            bottom: 10,
            right: 20,
            color: 'text.secondary',
            fontSize: 12
          }}
        >
          ©-UATF-2024-Diego-Fajardo
        </Typography>
      </Container>
    </ThemeProvider>
  );
};

export default Login;