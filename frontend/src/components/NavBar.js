// frontend/src/components/NavBar.js
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { Collapse, Nav, NavLink, DropdownItem, Button } from 'reactstrap';
import { FiMenu } from 'react-icons/fi';
import '../Global.css';

const NavBar = ({ onLogout }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [role, setRole] = useState('');
    const location = useLocation();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsLoggedIn(true);
            const decodedToken = jwtDecode(token);
            console.log('Decoded Token:', decodedToken);
            setRole(decodedToken.rol); // Cambia 'role' a 'rol'
        }
    }, []);

    useEffect(() => {
        setIsOpen(false);
    }, [location]);

    const toggleNav = () => {
        setIsOpen(!isOpen);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        setIsLoggedIn(false);
        setIsOpen(false);
        if (onLogout) onLogout();
    };

    const userId = localStorage.getItem('userId');
    //console.log('User ID:', userId); // Esto debería mostrar el ID del usuario

  return (
    <div>
        {isLoggedIn && (
            <>
                <div className={`sidebar ${isOpen ? 'open' : ''}`}>
                    <div className="navbar-brand-custom">
                        Gestión de <br /> Convocatorias
                    </div>
                    <Collapse isOpen={isOpen} navbar>
                        <Nav vertical navbar className="sidebar-nav">
                            <NavLink tag={Link} to="/facultades" className={location.pathname === '/facultades' ? 'active' : ''}>
                                Facultades
                            </NavLink>
                            <NavLink tag={Link} to="/carreras" className={location.pathname === '/carreras' ? 'active' : ''}>
                                Carreras
                            </NavLink>
                            <NavLink tag={Link} to="/tipoconvocatorias" className={location.pathname === '/tipoconvocatorias' ? 'active' : ''}>
                                Tipo de Convocatorias
                            </NavLink>
                            <NavLink tag={Link} to="/materias" className={location.pathname === '/materias' ? 'active' : ''}>
                                Materias
                            </NavLink>
                            <NavLink tag={Link} to="/convocatorias" className={location.pathname === '/convocatorias' ? 'active' : ''}>
                                Convocatorias
                            </NavLink>
                            <NavLink tag={Link} to="/convocatorias/convocatorias-estado" className={location.pathname === '/convocatorias/convocatorias-estado' ? 'active' : ''}>
                                Estado de Convocatorias
                            </NavLink>

                            {/* Mostrar "Perfil de Usuario" solo si está logueado */}
                            {userId && (
                                <NavLink tag={Link} to={`/usuarios/me/${userId}`} className={location.pathname === `/usuarios/me/${userId}` ? 'active' : ''}>
                                    Perfil de Usuario
                                </NavLink>
                            )}

                            {/* Mostrar "Usuarios" solo si es administrador */}
                            {role === 'admin' && (
                                <NavLink tag={Link} to="/usuarios" className={location.pathname === '/usuarios' ? 'active' : ''}>
                                    Usuarios
                                </NavLink>
                            )}

                            <DropdownItem divider />
                            <Button color="danger" onClick={handleLogout} className="logout-button">
                                Cerrar Sesión
                            </Button>
                        </Nav>
                    </Collapse>
                </div>
                <div className="sidebar-toggle">
                {!isOpen && (
                        <Button onClick={toggleNav} className="toggle-button">
                            <FiMenu size={24} />
                        </Button>
                    )}
                </div>
            </>
        )}
    </div>
  );
};

export default NavBar;