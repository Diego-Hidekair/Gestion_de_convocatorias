//frontend/src/components/FacultadList.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles.css';

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

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/facultades/${id}`);
            setFacultades(facultades.filter(facultad => facultad.id_facultad !== id));
        } catch (error) {
            console.error('Error al eliminar la facultad:', error);
        }
    };
    
    return (
        <div className="container">
            <h1>Lista de Facultades</h1>
            <Link to="/facultades/new">Crear Nueva Facultad</Link>
            <ul>
                {facultades.map(facultad => (
                    <li key={facultad.id_facultad}>
                        {facultad.nombre_facultad}
                        <div>
                            <Link to={`/facultades/edit/${facultad.id_facultad}`}>Editar</Link>
                            <button onClick={() => handleDelete(facultad.id_facultad)}>Eliminar</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default FacultadList;