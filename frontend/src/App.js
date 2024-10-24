// frontend/src/App.js
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import CarreraList from './components/CarreraList';
import FacultadList from './components/FacultadList';
import ConvocatoriaList from './components/ConvocatoriaList';
import ConvocatoriaForm from './components/ConvocatoriaForm';
import ConvocatoriaEdit from './components/ConvocatoriaEdit';
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
import UsuarioList from './components/UsuarioList';
import UsuarioForm from './components/UsuarioForm';
import UsuarioEdit from './components/UsuarioEdit';
import UsuarioPerfil from './components/UsuarioPerfil';
import RedirectPage from './components/RedirectPage';
import HonorariosForm from './components/HonorariosForm';
import NavBar from './components/NavBar';
import PDFGenerator from './components/PDFGenerator';
import PDFViewer from './components/PDFViewer';
import './styles/App.css';

axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
axios.defaults.baseURL = 'http://localhost:5000/';

const App = () => {
    return (
        <Router>
            <AuthWrapper />
        </Router>
    );
};

const AuthWrapper = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isOpen, setIsOpen] = useState(false); 
    const [userRole, setUserRole] = useState('');
    const navigate = useNavigate();


    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const expiryTime = JSON.parse(atob(token.split('.')[1])).exp * 1000;
            const currentTime = Date.now();

            if (currentTime >= expiryTime) {
                localStorage.removeItem('token');
                setIsAuthenticated(false);
                navigate('/login');
            } else {
                const decodedToken = jwtDecode(token);
                setUserRole(decodedToken.rol);
                setIsAuthenticated(true);
                const timeout = setTimeout(() => {
                    localStorage.removeItem('token');
                    setIsAuthenticated(false);
                    navigate('/login');
                }, expiryTime - currentTime);
                return () => clearTimeout(timeout);
            }
        } else {
            navigate('/login');
        }
    }, [navigate]);

    useEffect(() => {
        // estilo si esta en inicio de sesion y ya logeado
        if (isAuthenticated) {
            document.body.className = "app-body"; 
        } else {
            document.body.className = "login-body"; 
        }
    }, [isAuthenticated]);

    const handleLogin = () => {
        setIsAuthenticated(true);
        navigate('/redirect');
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        navigate('/login');
    };
    
    const toggleSidebar = () => {
        setIsOpen(!isOpen); 
    };
    
    return (
        <div className={`app-container ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
            <div className="background-app"></div>
            {isAuthenticated ? (
                <>
                    <NavBar onLogout={handleLogout} toggleSidebar={toggleSidebar} />
                    <Routes>
                        <Route path="/" element={<Navigate to="/redirect" />} /> 
                        <Route path="/redirect" element={<RedirectPage />} />
                        <Route path="/carreras" element={<CarreraList />} />
                        <Route path="/facultades" element={<FacultadList />} />
                        <Route path="/convocatorias" element={<ConvocatoriaList />} />
                        <Route path="/convocatorias/crear" element={<ConvocatoriaForm />} />
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
                        <Route path="/usuarios" element={<UsuarioList />} />
                        <Route path="/usuarios/new" element={<UsuarioForm />} />
                        <Route path="/usuarios/edit/:id_usuario" element={<UsuarioEdit />} />                        
                        <Route path="/usuarios/me/:id_usuario" element={<UsuarioPerfil />} />
                        <Route path="/honorarios/new/:id_convocatoria/:id_materia" element={<HonorariosForm />} />
                        <Route path="/pdf/generar/:id_convocatoria/:id_honorario" element={<PDFGenerator />} />
                        <Route path="/pdf/view/:id_convocatoria" element={<PDFViewer />} /> 
                    </Routes>
                </>
            ) : (
                <Routes>
                    <Route path="/login" element={<Login setAuth={handleLogin} />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
            )}
            
        </div>
    );
};

export default App;