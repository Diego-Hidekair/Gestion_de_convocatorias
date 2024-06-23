import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const FacultadList = () => {
    const [facultades, setFacultades] = useState([]);

    useEffect(() => {
        const fetchFacultades = async () => {
            try {
                const response = await axios.get('http://localhost:5000/facultades');
                setFacultades(response.data);
            } catch (error) {
                console.error('Error al obtener las facultades:', error);
            }
        };
        fetchFacultades();
    }, []);

    return (
        <div>
            <h1>Lista de Facultades</h1>
            <Link to="/facultades/new">Crear Nueva Facultad</Link>
            <ul>
                {facultades.map(facultad => (
                    <li key={facultad.id_facultad}>
                        {facultad.nombre_facultad}
                        <Link to={`/facultades/edit/${facultad.id_facultad}`}>Editar</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default FacultadList;
