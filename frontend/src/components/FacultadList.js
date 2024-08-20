//frontend/src/components/FacultadList.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

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
            <h1 className="my-4">Lista de Facultades</h1>
            <Link to="/facultades/new" className="btn btn-primary mb-3">Crear Nueva Facultad</Link>
            <ul className="list-group">
                {facultades.map(facultad => (
                    <li key={facultad.id_facultad} className="list-group-item d-flex justify-content-between align-items-center">
                        {facultad.nombre_facultad}
                        <div>
                            <Link to={`/facultades/edit/${facultad.id_facultad}`} className="btn btn-warning btn-sm me-2">Editar</Link>
                            <button onClick={() => handleDelete(facultad.id_facultad)} className="btn btn-danger btn-sm">Eliminar</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default FacultadList;