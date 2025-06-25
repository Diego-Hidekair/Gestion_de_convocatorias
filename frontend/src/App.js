// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Typography } from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import CarreraList from './components/CarreraList';
import FacultadList from './components/FacultadList';
import ConvocatoriaList from './components/convocatorias/ConvocatoriaList'; 
import ConvocatoriaForm from './components/convocatorias/ConvocatoriaForm';
import ConvocatoriaEdit from './components/convocatorias/ConvocatoriaEdit';
import ConvocatoriaDetalle from './components/convocatorias/ConvocatoriaDetalle'; 
import ConvocatoriaMaterias from './components/convocatorias/ConvocatoriaMaterias/ConvocatoriaMateriasEdit';
import TipoconvocatoriaList from './components/TipoconvocatoriaList';
import TipoconvocatoriaForm from './components/TipoconvocatoriaForm';
import TipoconvocatoriaEdit from './components/TipoconvocatoriaEdit';
import MateriaList from './components/MateriaList';
import ConvocatoriaMateriasEdit from './components/convocatorias/ConvocatoriaMaterias/ConvocatoriaMateriasEdit';
import ConvocatoriaMateriasForm from './components/convocatorias/ConvocatoriaMaterias/ConvocatoriaMateriasForm';
import Login from './components/Login';
import Register from './components/Register';
import FileUpload from './components/FileUpload';
import UsuarioManager from './components/usuarios/UsuarioManager'; 
import RedirectPage from './components/RedirectPage';
import HonorariosForm from './components/HonorariosForm';
import NavBar from './components/NavBar';
import ConvocatoriaArchivosManager from './components/convocatorias/ConvocatoriaArchivos/ConvocatoriaArchivosManager';
import NotificacionesPage from './components/notificaciones/NotificacionesPage';
import api from './config/axiosConfig';

const drawerWidthExpanded = 200;
const drawerWidthCollapsed = 70;

const theme = createTheme({
  palette: {
    primary: { main: '#D32F2F' },
    secondary: { main: '#1976D2' },
    background: { default: '#f5f5f5' },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h1: { fontWeight: 700, fontSize: '2.5rem' },
    h2: { fontWeight: 600, fontSize: '2rem' },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)',
        },
      },
    },
  },
});

const HeaderSection = ({ isAuthenticated }) => {
  if (!isAuthenticated) return null;
  return (
    <Box sx={{
      py: 4,
      background: `linear-gradient(to bottom, rgba(21, 101, 192, 0.7), rgba(21, 101, 192, 0.7)), url('https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/University_Citadel_UATF_-_Ciudadela_Universitaria_UATF.jpg/800px-University_Citadel_UATF_-_Ciudadela_Universitaria_UATF.jpg')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      color: 'white',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      mb: 3
    }}>
      <Box textAlign="center">
        <Typography variant="h2" sx={{ fontWeight: 'bold' }}>Gestión de Convocatorias</Typography>
        <Typography variant="h5" sx={{ mt: 2 }}>"Sistema de gestionamiento de convocatorias para docentes"</Typography>
      </Box>
    </Box>
  );
};

const FooterSection = ({ isAuthenticated }) => {
  if (!isAuthenticated) return null;
  return (
    <Box sx={{
      py: 2,
      backgroundColor: '#D32F2F',
      color: 'white',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
    }}>
      <Typography variant="body2">Copyright © 2025 | Universidad Autónoma Tomás Frías</Typography>
    </Box>
  );
};

const AuthWrapper = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const expiryTime = decodedToken.exp * 1000;
        const currentTime = Date.now();
        if (currentTime >= expiryTime) {
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          navigate('/login');
        } else {
          setUserRole(decodedToken.rol);
          setIsAuthenticated(true);
          setTimeout(() => {
            localStorage.removeItem('token');
            setIsAuthenticated(false);
            navigate('/login');
          }, expiryTime - currentTime);
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogin = () => {
    setIsAuthenticated(true);
    navigate('/redirect');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/login');
  };

   return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {isAuthenticated && (
        <NavBar
          onLogout={handleLogout}
          userRole={userRole}
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
          drawerWidthExpanded={drawerWidthExpanded}
          drawerWidthCollapsed={drawerWidthCollapsed}
        />
      )}

      <Box component="main" sx={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: 0,
        p: 3,
        width: `calc(100% - ${isAuthenticated ? (isExpanded ? drawerWidthExpanded : drawerWidthCollapsed) : 0}px)`,
        transition: (theme) => theme.transitions.create('margin', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        ml: `${isAuthenticated ? (isExpanded ? drawerWidthExpanded : drawerWidthCollapsed) : 0}px`,
      }}>
        <HeaderSection isAuthenticated={isAuthenticated} />
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'auto' }}>
          <Routes>
            {isAuthenticated ? (
              <>
                 <Route path="/" element={<Navigate to="/redirect" />} />
                <Route path="/redirect" element={<RedirectPage />} />
                <Route path="/carreras" element={<CarreraList />} />
                <Route path="/facultades" element={<FacultadList />} />
                <Route path="/notificaciones" element={<NotificacionesPage />} />

                {userRole === 'secretaria_de_decanatura' && (
                  <>
                    <Route path="/convocatorias/crear" element={<ConvocatoriaForm />} />
                    <Route path="/convocatorias/edit/:id" element={<ConvocatoriaEdit />} />
                    <Route path="/convocatorias/:id/materias" element={<ConvocatoriaMaterias />} />
                    <Route path="/convocatorias/:id/archivos" element={<ConvocatoriaArchivosManager />} />
                  </>
                )}
              {(userRole === 'vicerrectorado' || userRole === 'tecnico_vicerrectorado') && (
                <>
                  <Route path="/convocatorias/:id/archivos" element={<ConvocatoriaArchivosManager />} />
                </>
              )}
                <Route path="/convocatorias" element={<ConvocatoriaList />} />
                <Route path="/convocatorias/estado/:estado" element={<ConvocatoriaList />} />
                <Route path="/tipos-convocatorias" element={<TipoconvocatoriaList />} />
                <Route path="/tipos-convocatorias/crear" element={<TipoconvocatoriaForm />} />
                <Route path="/tipos-convocatorias/editar/:id" element={<TipoconvocatoriaEdit />} />
                <Route path="/materias" element={<MateriaList />} />
                <Route path="/convocatoria-materias/:id_convocatoria/materias" element={<ConvocatoriaMateriasForm />} />
                <Route path="/convocatorias_materias/edit/:id_convocatoria/:id_materia" element={<ConvocatoriaMateriasEdit />} />
                <Route path="/file-upload" element={<FileUpload />} />
                <Route path="/usuarios/*" element={<UsuarioManager />} />
                <Route path="/honorarios/new/:id_convocatoria/:id_materia" element={<HonorariosForm />} />
                <Route path="*" element={<Navigate to="/redirect" />} />
              </>
            ) : (
              <>
                <Route path="/login" element={<Login setAuth={handleLogin} />} />
                <Route path="/register" element={<Register />} />
                <Route path="*" element={<Navigate to="/login" />} />
              </>
            )}
          </Routes>
        </Box>
        <FooterSection isAuthenticated={isAuthenticated} />
      </Box>
    </Box>
  );
};

const App = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <Router>
      <AuthWrapper />
    </Router>
  </ThemeProvider>
);

export default App;