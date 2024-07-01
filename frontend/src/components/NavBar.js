import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './NavBar.css';

const NavBar = ({ onLogout }) => {
    const [navOpen, setNavOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
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
                            <li><Link to="/facultades" className={location.pathname === '/facultades' ? 'active' : ''}>Facultades</Link></li>
                            <li><Link to="/carreras" className={location.pathname === '/carreras' ? 'active' : ''}>Carreras</Link></li>
                            <li><Link to="/tipoconvocatorias" className={location.pathname === '/tipoconvocatorias' ? 'active' : ''}>Tipo de Convocatorias</Link></li>
                            <li><Link to="/materias" className={location.pathname === '/materias' ? 'active' : ''}>Materias</Link></li>
                            <li><Link to="/convocatorias" className={location.pathname === '/convocatorias' ? 'active' : ''}>Convocatorias</Link></li>
                            <li><Link to="/pdf-generator" className={location.pathname === '/pdf-generator' ? 'active' : ''}>Generador de PDF</Link></li>
                            <li><Link to="/usuarios" className={location.pathname === '/usuarios' ? 'active' : ''}>Usuarios</Link></li>
                            <li><button onClick={handleLogout}>Cerrar Sesión</button></li>
                        </ul>
                    </nav>
                </>
            )}
        </>
    );
};

export default NavBar;
