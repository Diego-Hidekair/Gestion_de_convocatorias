// src/components/NavBar.js
import React from 'react';
import { Link } from 'react-router-dom';

const NavBar = () => {
    return (
        <nav>
            <ul>
                <li><Link to="/facultades">Facultades</Link></li>
                <li><Link to="/carreras">Carreras</Link></li>
                <li><Link to="/tipoconvocatorias">tipoconvocatorias</Link></li>
                <li><Link to="/convocatorias">Convocatorias</Link></li>
            </ul>
        </nav>
    );
};

export default NavBar;
