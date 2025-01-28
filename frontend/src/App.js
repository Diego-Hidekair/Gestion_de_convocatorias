import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import CarreraList from './components/CarreraList';
import FacultadList from './components/FacultadList';
import ConvocatoriaList from './components/ConvocatoriaList';
import ConvocatoriaForm from './components/ConvocatoriaForm';
import NavBar from './components/NavBar';
import Login from './components/Login';
import Register from './components/Register';
import RedirectPage from './components/RedirectPage';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box, Typography, Button } from '@mui/material';

axios.defaults.baseURL = 'http://localhost:5000/';

const theme = createTheme({
    palette: {
        primary: {
            main: '#D32F2F',
        },
        secondary: {
            main: '#1976D2',
        },
    },
    typography: {
        fontFamily: 'Roboto, Arial, sans-serif',
    },
});

const HeaderSection = () => (
    <Box
        sx={{
            height: '20vh',
            background: `linear-gradient(to bottom, rgba(21, 101, 192, 0.7), rgba(21, 101, 192, 0.7)), url('https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/University_Citadel_UATF_-_Ciudadela_Universitaria_UATF.jpg/800px-University_Citadel_UATF_-_Ciudadela_Universitaria_UATF.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            color: 'white',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        }}
    >
        <Box textAlign="center">
            <Typography variant="h2" sx={{ fontWeight: 'bold' }}>
                Gestión de Convocatorias
            </Typography>
            <Typography variant="h5" sx={{ mt: 2 }}>
                "Sistema de gestionamiento de convocatorias para docentes"
            </Typography>
        </Box>
    </Box>
);

const FooterSection = () => (
    <Box
        sx={{
            height: '5vh', 
            backgroundColor: '#D32F2F',
            color: 'white',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            padding: 2, 
        }}
    >
        <Typography variant="body2">Copyright © 2025 | Universidad Autónoma Tomás Frías</Typography>
    </Box>
);

const AuthWrapper = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState('');
    const [userName, setUserName] = useState('');
    const [userLastName, setUserLastName] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(true); // Estado para manejar el sidebar
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const decodedToken = jwtDecode(token);
            const expiryTime = decodedToken.exp * 1000;
            const currentTime = Date.now();

            if (currentTime >= expiryTime) {
                localStorage.removeItem('token');
                setIsAuthenticated(false);
                navigate('/login');
            } else {
                setUserRole(decodedToken.rol);
                setUserName(decodedToken.nombre);
                setUserLastName(decodedToken.apellido_paterno);
                setIsAuthenticated(true);
                setTimeout(() => {
                    localStorage.removeItem('token');
                    setIsAuthenticated(false);
                    navigate('/login');
                }, expiryTime - currentTime);
            }
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

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
        <Box sx={{ display: 'flex' }}>
            <NavBar onLogout={handleLogout} toggleSidebar={toggleSidebar} />
            <Box
                sx={{
                    flexGrow: 1,
                    marginLeft: sidebarOpen ? '250px' : '0px', // Cambia dinámicamente
                    padding: 3,
                    transition: 'margin-left 0.3s ease', // Transición suave
                    backgroundColor: theme.palette.background.default,
                }}
            >
                {isAuthenticated ? (
                    <>
                        <Routes>
                            <Route path="/" element={<Navigate to="/redirect" />} />
                            <Route path="/redirect" element={<RedirectPage />} />
                            <Route path="/carreras" element={<CarreraList />} />
                            <Route path="/facultades" element={<FacultadList />} />
                            <Route path="/convocatorias" element={<ConvocatoriaList />} />
                            <Route path="/convocatorias/crear" element={<ConvocatoriaForm />} />
                        </Routes>
                    </>
                ) : (
                    <Routes>
                        <Route path="/login" element={<Login setAuth={handleLogin} />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="*" element={<Navigate to="/login" />} />
                    </Routes>
                )}
            </Box>
        </Box>
    );
};

const App = () => (
    <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
            <HeaderSection />
            <AuthWrapper />
            <FooterSection />
        </Router>
    </ThemeProvider>
);

export default App;