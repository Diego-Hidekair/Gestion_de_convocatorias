//frontend/src/components/Navbar.js 
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode'; 
import './NavBar.css';
import 'bootstrap/dist/css/bootstrap.min.css';


const NavBar = ({ onLogout }) => {
    const [navOpen, setNavOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [role, setRole] = useState('');
    const location = useLocation();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsLoggedIn(true);
            const decodedToken = jwtDecode(token); //decodifica la clave ingresada
            setRole(decodedToken.role); //esta cladve debe asegurarse que coincida con la clave en el token
        }
    }, []);

    const toggleNav = () => {
        setNavOpen(!navOpen);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        if (onLogout) onLogout();
    };

    return (
        <>
            {isLoggedIn && (
                <div className="navbar bg-light navbar-expand-lg navbar-light">
                    <div className="container-fluid">
                        <Link className="navbar-brand" to="/">Gestión de Convocatorias</Link>
                        <button className="navbar-toggler" type="button" onClick={toggleNav} aria-expanded={navOpen}>
                            <span className="navbar-toggler-icon"></span>
                        </button>
                        <div className={`collapse navbar-collapse ${navOpen ? 'show' : ''}`}>
                            <ul className="navbar-nav ms-auto">
                                {role === 'admin' && (
                                    <>
                                        <li className={`nav-item ${location.pathname === '/facultades' ? 'active' : ''}`}>
                                            <Link className="nav-link" to="/facultades">Facultades</Link>
                                        </li>
                                        <li className={`nav-item ${location.pathname === '/carreras' ? 'active' : ''}`}>
                                            <Link className="nav-link" to="/carreras">Carreras</Link>
                                        </li>
                                        <li className={`nav-item ${location.pathname === '/tipoconvocatorias' ? 'active' : ''}`}>
                                            <Link className="nav-link" to="/tipoconvocatorias">Tipo de Convocatorias</Link>
                                        </li>
                                        <li className={`nav-item ${location.pathname === '/materias' ? 'active' : ''}`}>
                                            <Link className="nav-link" to="/materias">Materias</Link>
                                        </li>
                                        <li className={`nav-item ${location.pathname === '/convocatorias' ? 'active' : ''}`}>
                                            <Link className="nav-link" to="/convocatorias">Convocatorias</Link>
                                        </li>
                                        <li className={`nav-item ${location.pathname === 'convocatorias/convocatorias-estado' ? 'active' : ''}`}>
                                            <Link className="nav-link" to="/convocatorias/convocatorias-estado">Estado de Convocatorias</Link>
                                        </li>
                                        <li className={`nav-item ${location.pathname === '/usuarios' ? 'active' : ''}`}>
                                            <Link className="nav-link" to="/usuarios">Usuarios</Link>
                                        </li>
                                    </>
                                )}
                                {role !== 'admin' && (
                                    <>
                                        <li className={`nav-item ${location.pathname === '/convocatorias' ? 'active' : ''}`}>
                                            <Link className="nav-link" to="/convocatorias">Convocatorias</Link>
                                        </li>
                                        <li className={`nav-item ${location.pathname === '/pdf-generator' ? 'active' : ''}`}>
                                            <Link className="nav-link" to="/pdf-generator">Generador de PDF</Link>
                                        </li>
                                        <li className={`nav-item ${location.pathname === '/convocatorias/convocatorias-estado' ? 'active' : ''}`}>
                                            <Link className="nav-link" to="/convocatorias/convocatorias-estado">Estado de Convocatorias</Link>
                                        </li>
                                    </>
                                )}
                                <li className="nav-item">
                                    <button onClick={handleLogout} className="btn btn-outline-danger ms-3">Cerrar Sesión</button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default NavBar;