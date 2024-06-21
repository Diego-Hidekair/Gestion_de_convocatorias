// src/components/FacultadList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const FacultadList = () => {
    const [facultades, setFacultades] = useState([]);
    const navigate = useNavigate();

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

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/facultades/${id}`);
            setFacultades(facultades.filter(facultad => facultad.cod_facultad !== id));
        } catch (error) {
            console.error('Error al eliminar la facultad:', error);
        }
    };

    return (
        <div>
            <h2>Lista de Facultades</h2>
            <ul>
                {facultades.map((facultad) => (
                    <li key={facultad.cod_facultad}>
                        {facultad.nombre_facultad} 
                        <Link to={`/facultades/${facultad.cod_facultad}/edit`}>Editar</Link>
                        <button onClick={() => handleDelete(facultad.cod_facultad)}>Eliminar</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default FacultadList;