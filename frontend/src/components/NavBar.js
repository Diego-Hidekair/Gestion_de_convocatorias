// frontend/src/components/NavBar.js
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode'; // Corregido import
import { Collapse, Navbar, NavbarToggler, NavbarBrand, Nav, NavItem, NavLink, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem, Button, Container } from 'reactstrap';
// import './NavBar.css'; // Archivo CSS para estilos personalizados (si es necesario)

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
      setRole(decodedToken.role);
    }
  }, []);

  const toggleNav = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    if (onLogout) onLogout();
  };

  return (
    <div>
      {isLoggedIn && (
        <>
          <Navbar color="dark" dark expand="lg" className="mb-4 custom-navbar">
            <Container fluid>
              <NavbarBrand href="/" className="navbar-brand-custom">
                Gestión de Convocatorias
              </NavbarBrand>
              <NavbarToggler onClick={toggleNav} />
              <Collapse isOpen={isOpen} navbar>
                <Nav className="me-auto" navbar>
                  <UncontrolledDropdown nav inNavbar>
                    
                      
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
                      {role === 'admin' && (
                       
                          <NavLink tag={Link} to="/usuarios" className={location.pathname === '/usuarios' ? 'active' : ''}>
                            Usuarios
                          </NavLink>
                        
                      )}
                      <DropdownItem divider />
                      
                        <Button color="danger" onClick={handleLogout} className="logout-button">
                          Cerrar Sesión
                        </Button>
                      
                
                  </UncontrolledDropdown>
                </Nav>
              </Collapse>
            </Container>
          </Navbar>
          <div className="collapse" id="navbarToggleExternalContent">
            <div className="bg-dark p-4">
              <h5 className="text-white h4">Contenido Colapsable</h5>
              <span className="text-muted">Contenido adicional aquí.</span>
            </div>
          </div>
          <nav className="navbar navbar-dark bg-dark">
            <div className="container-fluid">
              <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarToggleExternalContent" aria-controls="navbarToggleExternalContent" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
              </button>
            </div>
          </nav>
        </>
      )}
    </div>
  );
};

export default NavBar;
