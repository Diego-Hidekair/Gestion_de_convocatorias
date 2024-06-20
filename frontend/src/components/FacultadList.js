// src/components/FacultadList.js
import React, { useEffect, useState } from 'react';
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
                console.error('Error al obtener las facultades:', error);
            }
        };

        fetchFacultades();
    }, []);

    return (
        <div>
            <h2>Lista de Facultades</h2>
            <ul>
                {facultades.map(facultad => (
                    <li key={facultad.cod_facultad}>
                        {facultad.nombre_facultad}
                        <Link to={`/facultades/editar/${facultad.cod_facultad}`}>Editar</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default FacultadList;
