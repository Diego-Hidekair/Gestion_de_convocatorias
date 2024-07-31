//frontend/src/components/Navbar.js 
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Importa jwtDecode como una importación con nombre

import './NavBar.css';

const NavBar = ({ onLogout }) => {
    const [navOpen, setNavOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [role, setRole] = useState('');
    const location = useLocation();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsLoggedIn(true);
            const decodedToken = jwtDecode(token); // Decodifica el token
            setRole(decodedToken.role); // Asegúrate de que esto coincida con la clave en el token
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
                <>
                    <button className={`nav-toggle ${navOpen ? 'active' : ''}`} onClick={toggleNav}>
                        ☰
                    </button>
                    <nav className={navOpen ? 'open' : ''}>
                        <ul>
                            {role === 'admin' && (
                                <>
                                    <li><Link to="/facultades" className={location.pathname === '/facultades' ? 'active' : ''}>Facultades</Link></li>
                                    <li><Link to="/carreras" className={location.pathname === '/carreras' ? 'active' : ''}>Carreras</Link></li>
                                    <li><Link to="/tipoconvocatorias" className={location.pathname === '/tipoconvocatorias' ? 'active' : ''}>Tipo de Convocatorias</Link></li>
                                    <li><Link to="/materias" className={location.pathname === '/materias' ? 'active' : ''}>Materias</Link></li>
                                    <li><Link to="/convocatorias" className={location.pathname === '/convocatorias' ? 'active' : ''}>Convocatorias</Link></li>
                                </>
                            )}
                            {role !== 'admin' && (
                                <>
                                    <li><Link to="/convocatorias" className={location.pathname === '/convocatorias' ? 'active' : ''}>Convocatorias</Link></li>
                                    <li><Link to="/pdf-generator" className={location.pathname === '/pdf-generator' ? 'active' : ''}>Generador de PDF</Link></li>
                                </>
                            )}
                            <li><button onClick={handleLogout}>Cerrar Sesión</button></li>
                        </ul>
                    </nav>
                </>
            )}
        </>
    );
};

export default NavBar;