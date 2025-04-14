//frontend/App.js
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import CarreraList from './components/CarreraList';
import FacultadList from './components/FacultadList';
import ConvocatoriaList from './components/ConvocatoriaList';
import ConvocatoriaForm from './components/ConvocatoriaForm';
import ConvocatoriaEdit from './components/ConvocatoriaEdit';
import ConvocatoriaListSecretaria from './components/ConvocatoriaList_secretaria';
import ConvocatoriaParaRevision from './components/ConvocatoriaParaRevision';
import ConvocatoriaEnRevision from './components/ConvocatoriaEnRevision';
import ConvocatoriaObservado from './components/ConvocatoriaObservado';
import ConvocatoriaRevisado from './components/ConvocatoriaRevisado';
import TipoconvocatoriaList from './components/TipoconvocatoriaList';
import TipoconvocatoriaForm from './components/TipoconvocatoriaForm';
import TipoconvocatoriaEdit from './components/TipoconvocatoriaEdit';
import MateriaList from './components/MateriaList';
import ConvocatoriaMateriasEdit from './components/ConvocatoriaMateriasEdit';
import ConvocatoriaMateriasForm from './components/ConvocatoriaMateriasForm';
import Login from './components/Login';
import Register from './components/Register';
import FileUpload from './components/FileUpload';
import UsuarioManager from './components/UsuarioManager';
import RedirectPage from './components/RedirectPage';
import HonorariosForm from './components/HonorariosForm';
import NavBar from './components/NavBar';
import PDFGenerator from './components/PDFGenerator';
import PDFViewer from './components/PDFViewer';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';

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
        <Box>
            {isAuthenticated ? (
                <>
                    <NavBar onLogout={handleLogout} userRole={userRole} />
                    <Routes>
                        <Route path="/" element={<Navigate to="/redirect" />} />
                        <Route path="/redirect" element={<RedirectPage />} /> 
                        <Route path="/carreras" element={<CarreraList />} />
                        <Route path="/facultades" element={<FacultadList />} />
                        {(userRole === 'admin' || userRole === 'secretaria_de_decanatura' || userRole === 'vicerrectorado' || userRole === 'tecnico_vicerrectorado') && (
                            <Route path="/convocatorias" element={<ConvocatoriaList />} />
                        )}
                        {userRole === 'secretaria_de_decanatura' && (
                            <Route path="/convocatorias/crear" element={<ConvocatoriaForm />} />
                        )}
                        {userRole === 'secretaria_de_decanatura' && (
                            <Route path="/convocatorias/facultad" element={<ConvocatoriaListSecretaria />} />
                        )}
                        <Route path="/convocatorias/edit/:id" element={<ConvocatoriaEdit />} />
                        <Route path="/convocatorias/:id/materias" element={<ConvocatoriaMateriasEdit />} />
                        <Route path="/convocatorias/estado/para-revision" element={<ConvocatoriaParaRevision />} />
                        <Route path="/convocatorias/estado/en-revision" element={<ConvocatoriaEnRevision />} />
                        <Route path="/convocatorias/estado/observado" element={<ConvocatoriaObservado />} />
                        <Route path="/convocatorias/estado/revisado" element={<ConvocatoriaRevisado />} />
                        <Route path="/tipos-convocatorias" element={<TipoconvocatoriaList />} />
                        <Route path="/tipos-convocatorias/crear" element={<TipoconvocatoriaForm />} />
                        <Route path="/tipos-convocatorias/editar/:id" element={<TipoconvocatoriaEdit />} />
                        <Route path="/materias" element={<MateriaList />} />
                        <Route path="/convocatorias_materias/new/:id_convocatoria" element={<ConvocatoriaMateriasForm />} />
                        <Route path="/convocatorias_materias/edit/:id_convocatoria/:id_materia" element={<ConvocatoriaMateriasEdit />} />
                        <Route path="/file-upload" element={<FileUpload />} />
                        {/* Rutas actualizadas para UsuarioManager */}
                        <Route path="/usuarios" element={<UsuarioManager />} />
                        <Route path="/usuarios/new" element={<UsuarioManager />} />
                        <Route path="/usuarios/edit/:id" element={<UsuarioManager />} />
                        <Route path="/usuarios/view/:id" element={<UsuarioManager />} />
                        <Route path="/perfil" element={<UsuarioManager />} />
                        <Route path="/honorarios/new/:id_convocatoria/:id_materia" element={<HonorariosForm />} />
                        <Route path="/pdf/generar/:id_convocatoria/:id_honorario" element={<PDFGenerator />} />
                        <Route path="/pdf/combinado/:id_convocatoria" element={<PDFViewer />} />
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