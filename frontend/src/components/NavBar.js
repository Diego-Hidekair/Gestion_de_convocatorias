// src/components/NavBar.js
import React from 'react';
import { Link } from 'react-router-dom';

const NavBar = () => {
    return (
        <nav>
            <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/facultades">Lista de Facultades</Link></li>
                <li><Link to="/facultades/nueva">Crear Facultad</Link></li>
                <li><Link to="/carreras">Lista de Carreras</Link></li>
                <li><Link to="/carreras/nueva">Crear Carrera</Link></li>
                <li><Link to="/convocatorias">Lista de Convocatorias</Link></li>
                <li><Link to="/convocatorias/nueva">Crear Convocatoria</Link></li>
            </ul>
        </nav>
    );
}

export default NavBar;
