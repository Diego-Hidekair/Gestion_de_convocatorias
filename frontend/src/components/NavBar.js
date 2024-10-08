// frontend/src/components/NavBar.js
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { Collapse, Nav, NavLink, DropdownItem, Button, UncontrolledDropdown, DropdownToggle, DropdownMenu } from 'reactstrap';
import { FiMenu } from 'react-icons/fi';
import '../styles/Sidebar.css';

const NavBar = ({ onLogout }) => { // Elimina `toggleSidebar` aquí
    const [isOpen, setIsOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [role, setRole] = useState(''); // rol del usuario
    const location = useLocation();
    
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsLoggedIn(true);
            const decodedToken = jwtDecode(token);
            setRole(decodedToken.rol);
        }
    }, []);

    useEffect(() => {
        setIsOpen(false);
    }, [location]);

    const toggleSidebar = () => {
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

    const closeMenu = () => {
        setIsOpen(false);
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
                    <nav className={`sidebar ${isOpen ? 'open' : ''}`} id="sidebar">
                        {isOpen && (
                            <img src="/imagenes/LOG-fd8360d8.png" alt="Logo" className="navbar-logo" />
                        )}
                        {isOpen && (
                            <div className="navbar-brand-custom">
                                Gestión de <br /> Convocatorias
                            </div>
                        )}
                        <Collapse isOpen={isOpen} navbar>
                            <Nav vertical navbar className="sidebar-nav">
                                {/* Solo para usuarios con rol admin y vicerrectorado */}
                                {(role === 'admin' || role === 'vicerrectorado') && (
                                    <>
                                        <NavLink tag={Link} to="/facultades" className={location.pathname === '/facultades' ? 'active' : ''}>
                                            <span className="nav-text">Facultades</span>
                                        </NavLink>
                                        <NavLink tag={Link} to="/carreras" className={location.pathname === '/carreras' ? 'active' : ''}>
                                            <span className="nav-text">Carreras</span>
                                        </NavLink>
                                        <NavLink tag={Link} to="/tipoconvocatorias" className={location.pathname === '/tipoconvocatorias' ? 'active' : ''}>
                                            <span className="nav-text">Tipo de Convocatorias</span>
                                        </NavLink>
                                        <NavLink tag={Link} to="/materias" className={location.pathname === '/materias' ? 'active' : ''}>
                                            <span className="nav-text">Materias</span>
                                        </NavLink>
                                    </>
                                )}
                                <NavLink tag={Link} to="/convocatorias" className={location.pathname === '/convocatorias' ? 'active' : ''}>
                                    <span className="nav-text">Convocatorias</span>
                                </NavLink>
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
                                {userId && (
                                    <NavLink tag={Link} to={`/usuarios/me/${userId}`} className={location.pathname === `/usuarios/me/${userId}` ? 'active' : ''}>
                                        <span className="nav-text">Perfil de Usuario</span>
                                    </NavLink>
                                )}
                                {/* Solo para usuarios con rol admin */}
                                {role === 'admin' && (
                                    <NavLink tag={Link} to="/usuarios" className={location.pathname === '/usuarios' ? 'active' : ''}>
                                        <span className="nav-text">Usuarios</span>
                                    </NavLink>
                                )}
                                <DropdownItem divider />
                                <Button color="danger" onClick={handleLogout} className="logout-button">
                                    Cerrar Sesión
                                </Button> 
                                <Button className="close-menu-button" onClick={closeMenu}>
                                    Cerrar Menú
                                </Button>
                            </Nav>
                        </Collapse>
                    </nav>
                    <div className="sidebar-toggle">
                        {!isOpen && (
                            <Button onClick={toggleSidebar} className="toggle-button">
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
