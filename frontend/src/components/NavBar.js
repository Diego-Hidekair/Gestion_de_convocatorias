// src/components/NavBar.js
import React from 'react';
import { Link } from 'react-router-dom';

const NavBar = () => {
    return (
        <nav>
            <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/facultades">Crear Facultad</Link></li>
                <li><Link to="/carreras">Crear Carrera</Link></li>
                <li><Link to="/convocatorias">Crear Convocatoria</Link></li>
            </ul>
        </nav>
    );
}

export default NavBar;
