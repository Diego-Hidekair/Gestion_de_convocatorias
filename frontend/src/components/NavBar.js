// frontend/src/components/NavBar.js
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode'; // Corrige el import de jwtDecode sin llaves
import { Collapse, Nav, NavLink, DropdownItem, Button, UncontrolledDropdown, DropdownToggle, DropdownMenu } from 'reactstrap';
import { FiMenu, FiUser, FiUsers, FiActivity, FiBookOpen, FiClipboard, FiLayers, FiHome, FiBook, FiCheckSquare, FiFileText } from 'react-icons/fi';
import '../styles/Sidebar.css';

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
                            <header className="sidebar-header">
                                <img src="/imagenes/LOG-fd8360d8.png" alt="Logo" className="navbar-logo" />
                                <div className="navbar-titulo">
                                    Gestión de <br /> Convocatorias
                                </div>
                            </header>
                        )}
                        <Collapse isOpen={isOpen} navbar>
                            <Nav vertical navbar className="sidebar-nav">
                                {(role === 'admin' || role === 'vicerrectorado') && (
                                    <>
                                        <NavLink tag={Link} to="/facultades" className={location.pathname === '/facultades' ? 'active' : ''}>
                                            <FiHome className="nav-icon" />
                                            {isOpen && <span className="nav-text">Facultades</span>}
                                        </NavLink>
                                        <NavLink tag={Link} to="/carreras" className={location.pathname === '/carreras' ? 'active' : ''}>
                                            <FiBook className="nav-icon" />
                                            {isOpen && <span className="nav-text">Carreras</span>}
                                        </NavLink>
                                        <NavLink tag={Link} to="/tipos-convocatorias" className={location.pathname === '/tipos-convocatorias' ? 'active' : ''}>
                                            <FiLayers className="nav-icon" />
                                            {isOpen && <span className="nav-text">Tipo de Convocatorias</span>}
                                        </NavLink>
                                        <NavLink tag={Link} to="/materias" className={location.pathname === '/materias' ? 'active' : ''}>
                                            <FiBookOpen className="nav-icon" />
                                            {isOpen && <span className="nav-text">Materias</span>}
                                        </NavLink>
                                        <NavLink tag={Link} to="/convocatorias" className={location.pathname === '/convocatorias' ? 'active' : ''}>
                                            <FiClipboard className="nav-icon" />
                                            <span className="nav-text">Convocatorias</span>
                                        </NavLink>
                                        <UncontrolledDropdown nav inNavbar>
                                    <DropdownToggle nav caret>
                                        <FiActivity className="nav-icon" />
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
                                            Publicado
                                        </DropdownItem>
                                    </DropdownMenu>
                                </UncontrolledDropdown>
                                    </>
                                )}
                                {role === 'secretaria' && (
                                    <>
                                        <NavLink tag={Link} to="/convocatorias" className={location.pathname === '/convocatorias' ? 'active' : ''}>
                                            <FiClipboard className="nav-icon" />
                                            <span className="nav-text">Convocatorias</span>
                                        </NavLink>
                                        <NavLink tag={Link} to="/convocatorias/crear" className={location.pathname === '/convocatorias/crear' ? 'active' : ''}>
                                            <FiCheckSquare className="nav-icon" />
                                            <span className="nav-text">Crear Convocatoria</span>
                                        </NavLink>
                                        <NavLink tag={Link} to="/convocatorias/facultad" className={location.pathname === '/convocatorias/facultad' ? 'active' : ''}>
                                            <FiFileText className="nav-icon" />
                                            <span className="nav-text">Convocatorias Creadas</span>
                                        </NavLink>
                                        <UncontrolledDropdown nav inNavbar>
                                    <DropdownToggle nav caret>
                                        <FiActivity className="nav-icon" />
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
                                            Publicado
                                        </DropdownItem>
                                    </DropdownMenu>
                                </UncontrolledDropdown> 
                                        
                                    </>
                                    
                                )} 
                                {role === 'decanatura' && (
                                    <>
                                        <NavLink tag={Link} to="/convocatorias" className={location.pathname === '/convocatorias' ? 'active' : ''}>
                                            <FiClipboard className="nav-icon" />
                                            <span className="nav-text">Convocatorias</span>
                                        </NavLink>
                                        <NavLink tag={Link} to="/convocatorias/crear" className={location.pathname === '/convocatorias/crear' ? 'active' : ''}>
                                            <FiCheckSquare className="nav-icon" />
                                            <span className="nav-text">Crear Convocatoria</span>
                                        </NavLink>
                                        <NavLink tag={Link} to="/convocatorias/facultad" className={location.pathname === '/convocatorias/facultad' ? 'active' : ''}>
                                            <FiFileText className="nav-icon" />
                                            <span className="nav-text">Convocatorias Creadas</span>
                                        </NavLink>
                                        <UncontrolledDropdown nav inNavbar>
                                    <DropdownToggle nav caret>
                                        <FiActivity className="nav-icon" />
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
                                            Publicado
                                        </DropdownItem>
                                    </DropdownMenu>
                                </UncontrolledDropdown> 
                                    </>
                                )} 
                                {role === 'vicerrectorado' && (
                                    <>
                                        <NavLink tag={Link} to="/convocatorias" className={location.pathname === '/convocatorias' ? 'active' : ''}>
                                            <FiClipboard className="nav-icon" />
                                            <span className="nav-text">Convocatorias</span>
                                        </NavLink>
                                        <NavLink tag={Link} to="/convocatorias/crear" className={location.pathname === '/convocatorias/crear' ? 'active' : ''}>
                                            <FiCheckSquare className="nav-icon" />
                                            <span className="nav-text">Crear Convocatoria</span>
                                        </NavLink>
                                        <NavLink tag={Link} to="/convocatorias/facultad" className={location.pathname === '/convocatorias/facultad' ? 'active' : ''}>
                                            <FiFileText className="nav-icon" />
                                            <span className="nav-text">Convocatorias Creadas</span>
                                        </NavLink>
                                        <UncontrolledDropdown nav inNavbar>
                                    <DropdownToggle nav caret>
                                        <FiActivity className="nav-icon" />
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
                                            Publicado
                                        </DropdownItem>
                                    </DropdownMenu>
                                </UncontrolledDropdown> 
                                    </>
                                )} 
                                
                                {userId && (
                                    <NavLink tag={Link} to={`/usuarios/me/${userId}`} className={location.pathname === `/usuarios/me/${userId}` ? 'active' : ''}>
                                        <FiUser className="nav-icon" />
                                        <span className="nav-text">Perfil de Usuario</span>
                                    </NavLink>
                                )}
                                {role === 'admin' && (
                                    <NavLink tag={Link} to="/usuarios" className={location.pathname === '/usuarios' ? 'active' : ''}>
                                        <FiUsers className="nav-icon" />
                                        <span className="nav-text">Usuarios</span>
                                    </NavLink>
                                )}
                                <br />
                                <DropdownItem divider />
                                <Button color="danger" onClick={handleLogout} className="logout-button">
                                    Cerrar Sesión
                                </Button>
                            </Nav> 
                        </Collapse>
                    </nav>
                    
                    <div className="sidebar-toggle">
                        <Button onClick={toggleSidebar} className="toggle-button">
                            <FiMenu size={24} />
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
};

export default NavBar;
