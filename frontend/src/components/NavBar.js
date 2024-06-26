// src/components/NavBar.js
import React from 'react';
import { Link } from 'react-router-dom';

const NavBar = ({ onLogout }) => {
    return (
        <nav>
            <ul>
                <li><Link to="/facultades">Facultades</Link></li>
                <li><Link to="/carreras">Carreras</Link></li>
                <li><Link to="/tipoconvocatorias">Tipo de Convocatorias</Link></li>
                <li><Link to="/materias">Materias</Link></li>
                <li><Link to="/convocatorias">Convocatorias</Link></li>
                <li><Link to="/pdf-generator">Generador de PDF</Link></li>
                <li><Link to="/usuarios">Usuarios</Link></li>
                <li><button onClick={onLogout}>Cerrar Sesión</button></li>
            </ul>
        </nav>
    );
};

export default NavBar;


