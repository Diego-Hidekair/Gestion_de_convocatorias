// frontend/src/App.js
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
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

    useEffect(() => {
        document.body.className = isAuthenticated ? "app-body" : "login-body";
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
                    <header className="header-app">    
                        <h1>Aplicación Web de Gestión de Convocatorias</h1>
                        <div className="user-info">
                            <i className="user-icon fas fa-user-circle"></i>
                            <span>{userName} {userLastName}</span>
                        </div>
                        <div>
                            <img src="/imagenes/LOG-fd8360d8.png" alt="Logo" className="logo" />
                        </div>
                    </header>
                    <NavBar onLogout={handleLogout} toggleSidebar={toggleSidebar} userRole={userRole} />
                    <Routes>
                    <Route path="/" element={<Navigate to="/redirect" />} /> 
                        <Route path="/redirect" element={<RedirectPage />} />
                        <Route path="/carreras" element={<CarreraList />} />
                        <Route path="/facultades" element={<FacultadList />} />
                        <Route path="/convocatorias" element={<ConvocatoriaList />} />
                        {userRole === 'secretaria' && (
                            <Route path="/convocatorias/crear" element={<ConvocatoriaForm />} />
                        )}
                        {userRole === 'secretaria' && (
                            <Route path="/convocatorias/creadas" element={<ConvocatoriaListSecretaria />} />
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
                        <Route path="/usuarios" element={<UsuarioList />} />
                        <Route path="/usuarios/new" element={<UsuarioForm />} />
                        <Route path="/usuarios/edit/:id_usuario" element={<UsuarioEdit />} />                        
                        <Route path="/usuarios/me/:id_usuario" element={<UsuarioPerfil />} />
                        <Route path="/honorarios/new/:id_convocatoria/:id_materia" element={<HonorariosForm />} />
                        <Route path="/pdf/generar/:id_convocatoria/:id_honorario" element={<PDFGenerator />} />
                        <Route path="/pdf/combinado/:id_convocatoria" element={<PDFViewer />} /> 
                    </Routes>
                    <footer className="footer-app">
                        <p className="titulo-pie">Copyright © UATF - Diego Fajardo</p>
                    </footer>
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