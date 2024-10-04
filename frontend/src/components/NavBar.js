// frontend/src/components/NavBar.js
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { Collapse, Nav, NavLink, DropdownItem, Button, UncontrolledDropdown, DropdownToggle, DropdownMenu } from 'reactstrap';
import { FiMenu } from 'react-icons/fi';
import '../Global.css';

const NavBar = ({ onLogout }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [role, setRole] = useState(''); // Rol del usuario
    const location = useLocation();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsLoggedIn(true);
            const decodedToken = jwtDecode(token);
            setRole(decodedToken.rol); // Actualiza el rol con el token decodificado
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

    const userId = localStorage.getItem('userId'); // Obtén el ID del usuario desde localStorage

    const closeMenu = () => {
        setIsOpen(false); // Cierra el menú al hacer clic en "Cerrar Menú"
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            const sidebar = document.querySelector('.sidebar');
            if (sidebar && isOpen && !sidebar.contains(event.target)) {
                setIsOpen(false);
            }
        };
    
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div>
            {isLoggedIn && (
                <>
                    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
                        {/* Añade el logo */}
                        <img src="/imagenes/LOG-fd8360d8.png" alt="Logo" className="navbar-logo" />

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

                                {/* Menú desplegable para los Estados de Convocatoria */}
                                <UncontrolledDropdown nav inNavbar>
                                    <DropdownToggle nav caret>
                                        Estados de Convocatoria
                                    </DropdownToggle>
                                    <DropdownMenu end>
                                        <DropdownItem tag={Link} to="/convocatorias/estado/para-revision" className={location.pathname === '/convocatorias/estado/para-revision' ? 'active' : ''}>
                                            Para Revisión
                                        </DropdownItem>
                                        <DropdownItem tag={Link} to="/convocatorias/estado/en-revision" className={location.pathname === '/convocatorias/estado/en-revision' ? 'active' : ''}>
                                            En Revisión
                                        </DropdownItem>
                                        <DropdownItem tag={Link} to="/convocatorias/estado/observado" className={location.pathname === '/convocatorias/estado/observado' ? 'active' : ''}>
                                            Observado
                                        </DropdownItem>
                                        <DropdownItem tag={Link} to="/convocatorias/estado/revisado" className={location.pathname === '/convocatorias/estado/revisado' ? 'active' : ''}>
                                            Revisado
                                        </DropdownItem>
                                    </DropdownMenu>
                                </UncontrolledDropdown>

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

                                {/* Botón para cerrar el menú */}
                                <Button className="close-menu-button" onClick={closeMenu}>
                                    Cerrar Menú
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