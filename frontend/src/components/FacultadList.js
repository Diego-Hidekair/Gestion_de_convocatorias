// src/components/FacultadList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const FacultadList = () => {
    const [facultades, setFacultades] = useState([]);

    useEffect(() => {
        const fetchFacultades = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/facultades');
                setFacultades(response.data);
            } catch (error) {
                console.error('Error al obtener facultades:', error);
            }
        };

        fetchFacultades();
    }, []);

    return (
        <div>
            <h2>Lista de Facultades</h2>
            <ul>
                {facultades.map((facultad) => (
                    <li key={facultad.cod_facultad}>
                        {facultad.nombre_facultad} 
                        <Link to={`/facultades/${facultad.cod_facultad}/edit`}>Editar</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default FacultadList;