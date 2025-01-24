// frontend/src/App.js
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Drawer, AppBar, Toolbar, IconButton, Typography } from '@mui/material';
import { AppBar, Toolbar, Box, Typography, Avatar, Stack } from '@mui/material';
import CarreraList from './components/CarreraList';
import FacultadList from './components/FacultadList';
import ConvocatoriaList from './components/ConvocatoriaList';
import ConvocatoriaForm from './components/ConvocatoriaForm';
import NavBar from './components/NavBar';
import Login from './components/Login';
import Register from './components/Register';
import RedirectPage from './components/RedirectPage';





import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';



axios.defaults.baseURL = 'http://localhost:5000/';

const theme = createTheme({
    palette: {
        primary: {
            main: '#D32F2F',
        },
        secondary: {
            main: '#1976D2',
        },
        background: {
            default: '#FFFFFF',
        },
        text: {
            primary: '#000000',
            secondary: '#1976D2',
        },
    },
    typography: {
        fontFamily: 'Roboto, Arial, sans-serif',
        h1: {
            fontSize: '2rem',
            fontWeight: 'bold',
        },
    },
});

const Header = ({ userName, userLastName }) => (
    <AppBar position="sticky" color="primary">
        <Toolbar>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ flexGrow: 1 }}>
                <Avatar alt="Logo" src="/imagenes/LOG-fd8360d8.png" />
                <Typography variant="h6">Aplicación Web de Gestión de Convocatorias</Typography>
            </Stack>
            <Typography variant="subtitle1">
                {userName} {userLastName}
            </Typography>
        </Toolbar>
    </AppBar>
);

const Footer = () => (
    <Box
        component="footer"
        sx={{
            textAlign: 'center',
            padding: 2,
            backgroundColor: theme.palette.primary.main,
            color: 'white',
            position: 'relative',
            bottom: 0,
            width: '100%',
        }}
    >
        <Typography variant="body2">Copyright © UATF - Diego Fajardo</Typography>
    </Box>
);

const AuthWrapper = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState('');
    const [userName, setUserName] = useState('');
    const [userLastName, setUserLastName] = useState('');
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
        <Box sx={{ display: 'flex'}}>
            <NavBar onLogout={handleLogout} />
            <Box sx={{
            flexGrow: 1,
            marginLeft: { xs: 0, sm: '250px' },
            padding: 0,
            backgroundColor: theme.palette.background.default,
        }}
    >
                {isAuthenticated ? (
            <>
                <Header userName={userName} userLastName={userLastName} />
                <Routes>
                    <Route path="/" element={<Navigate to="/redirect" />} />
                    <Route path="/redirect" element={<RedirectPage />} />
                    <Route path="/carreras" element={<CarreraList />} />
                    <Route path="/facultades" element={<FacultadList />} />
                    <Route path="/convocatorias" element={<ConvocatoriaList />} />
                    <Route path="/convocatorias/crear" element={<ConvocatoriaForm />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                </Routes>
            </>
            ) : (
                <Routes>
                    <Route path="/login" element={<Login setAuth={handleLogin} />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="*" element={<Navigate to="/redirect" />} />
                </Routes>
            )}
            <Footer />
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
