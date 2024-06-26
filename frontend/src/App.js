// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import CarreraList from './components/CarreraList';
import CarreraForm from './components/CarreraForm';
import CarreraEdit from './components/CarreraEdit';
import FacultadList from './components/FacultadList';
import FacultadEdit from './components/FacultadEdit';
import FacultadForm from './components/FacultadForm';
import ConvocatoriaList from './components/ConvocatoriaList';
import ConvocatoriaForm from './components/ConvocatoriaForm';
import ConvocatoriaEdit from './components/ConvocatoriaEdit';
import TipoconvocatoriaList from './components/TipoconvocatoriaList';
import TipoconvocatoriaForm from './components/TipoconvocatoriaForm';
import TipoconvocatoriaEdit from './components/TipoconvocatoriaEdit';
import MateriaList from './components/MateriaList';
import MateriaForm from './components/MateriaForm';
import MateriaEdit from './components/MateriaEdit';
import NavBar from './components/NavBar';
import ConvocatoriaMateriasForm from './components/ConvocatoriaMateriasForm';
import PDFGenerator from './components/PDFGenerator';
import UsuarioForm from './components/UsuarioForm';
import UsuarioList from './components/UsuarioList';
import Login from './components/Login';
import Register from './components/Register';
import FileUpload from './components/FileUpload';

const App = () => {
    return (
        <Router>
            <AuthWrapper />
        </Router>
    );
};

const AuthWrapper = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
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
        navigate('/');
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        navigate('/login');
    };


    return (
        <>
            {isAuthenticated ? (
                <>
                    <NavBar onLogout={handleLogout} />
                    <Routes>
                        <Route path="/" element={<Navigate to="/carreras" />} />
                        <Route path="/carreras" element={<CarreraList />} />
                        <Route path="/carreras/new" element={<CarreraForm />} />
                        <Route path="/carreras/edit/:id" element={<CarreraEdit />} />
                        <Route path="/facultades" element={<FacultadList />} />
                        <Route path="/facultades/edit/:id" element={<FacultadEdit />} />
                        <Route path="/facultades/new" element={<FacultadForm />} />
                        <Route path="/convocatorias" element={<ConvocatoriaList />} />
                        <Route path="/convocatorias/new" element={<ConvocatoriaForm />} />
                        <Route path="/convocatorias/edit/:id" element={<ConvocatoriaEdit />} />
                        <Route path="/convocatorias/:id_convocatoria/materias" element={<ConvocatoriaMateriasForm />} />
                        <Route path="/tipoconvocatorias" element={<TipoconvocatoriaList />} />
                        <Route path="/tipoconvocatorias/new" element={<TipoconvocatoriaForm />} />
                        <Route path="/tipoconvocatorias/edit/:id" element={<TipoconvocatoriaEdit />} />
                        <Route path="/materias" element={<MateriaList />} />
                        <Route path="/materias/new" element={<MateriaForm />} />
                        <Route path="/materias/edit/:id" element={<MateriaEdit />} />
                        <Route path="/pdf-generator" element={<PDFGenerator />} />
                        <Route path="/usuarios/new" element={<UsuarioForm />} />
                        <Route path="/usuarios" element={<UsuarioList />} />
                        <Route path="/file-upload" element={<FileUpload />} />
                    </Routes>
                </>
            ) : (
                <Routes>
                    <Route path="/login" element={<Login setAuth={handleLogin} />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
            )}
        </>
    );
};

export default App;