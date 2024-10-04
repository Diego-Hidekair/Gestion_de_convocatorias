// frontend/src/App.js
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import CarreraList from './components/CarreraList';
import CarreraForm from './components/CarreraForm';
import CarreraEdit from './components/CarreraEdit';
import FacultadList from './components/FacultadList';
import FacultadEdit from './components/FacultadEdit';
import FacultadForm from './components/FacultadForm';
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
import MateriaForm from './components/MateriaForm';
import MateriaEdit from './components/MateriaEdit';
import ConvocatoriaMateriasEdit from './components/ConvocatoriaMateriasEdit';
import ConvocatoriaMateriasForm from './components/ConvocatoriaMateriasForm';
import Login from './components/Login';
import Register from './components/Register';
import FileUpload from './components/FileUpload';
import NavBar from './components/NavBar';
import UsuarioList from './components/UsuarioList';
import UsuarioForm from './components/UsuarioForm';
import UsuarioEdit from './components/UsuarioEdit';
import UsuarioPerfil from './components/UsuarioPerfil';
import RedirectPage from './components/RedirectPage';
import HonorariosForm from './components/HonorariosForm';
import PDFGenerator from './components/PDFGenerator';
import PDFViewer from './components/PDFViewer';

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
        <div>
            {isAuthenticated ? (
                <>
                    <NavBar onLogout={handleLogout} />
                    <Routes>
                        <Route path="/" element={<Navigate to="/carreras" />} />
                        <Route path="/redirect" element={<RedirectPage />} />
                        <Route path="/carreras" element={<CarreraList />} />
                        <Route path="/carreras/new" element={<CarreraForm />} />
                        <Route path="/carreras/edit/:id" element={<CarreraEdit />} />
                        <Route path="/facultades" element={<FacultadList />} />
                        <Route path="/facultades/edit/:id" element={<FacultadEdit />} />
                        <Route path="/facultades/new" element={<FacultadForm />} />
                        <Route path="/convocatorias" element={<ConvocatoriaList />} />
                        <Route path="/convocatorias/crear" element={<ConvocatoriaForm />} />
                        <Route path="/convocatorias/edit/:id" element={<ConvocatoriaEdit />} />
                        <Route path="/convocatorias/:id/materias" element={<ConvocatoriaMateriasEdit />} />
                        <Route path="/convocatorias/estado/para-revision" element={<ConvocatoriaParaRevision />} />
                        <Route path="/convocatorias/estado/en-revision" element={<ConvocatoriaEnRevision />} />
                        <Route path="/convocatorias/estado/observado" element={<ConvocatoriaObservado />} />
                        <Route path="/convocatorias/estado/revisado" element={<ConvocatoriaRevisado />} />
                        <Route path="/tipoconvocatorias" element={<TipoconvocatoriaList />} />
                        <Route path="/tipoconvocatorias/crear" element={<TipoconvocatoriaForm />} />
                        <Route path="/tipoconvocatorias/editar/:id" element={<TipoconvocatoriaEdit />} />
                        <Route path="/materias" element={<MateriaList />} />
                        <Route path="/materias/crear" element={<MateriaForm />} />
                        <Route path="/materias/editar/:id" element={<MateriaEdit />} />
                        <Route path="/convocatorias_materias/new/:id_convocatoria" element={<ConvocatoriaMateriasForm />} />
                        <Route path="/convocatorias_materias/edit/:id_convocatoria/:id_materia" element={<ConvocatoriaMateriasEdit />} />
                        <Route path="/file-upload" element={<FileUpload />} />
                        <Route path="/usuarios" element={<UsuarioList />} />
                        <Route path="/usuarios/new" element={<UsuarioForm />} />
                        <Route path="/usuarios/edit/:id" element={<UsuarioEdit />} />
                        <Route path="/usuarios/me/:id" element={<UsuarioPerfil />} />
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