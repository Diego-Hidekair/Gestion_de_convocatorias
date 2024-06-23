// src/components/CarreraList.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const CarreraList = () => {
    const [carreras, setCarreras] = useState([]);

    useEffect(() => {
        const fetchCarreras = async () => {
            try {
                const response = await axios.get('http://localhost:5000/carreras');
                setCarreras(response.data);
            } catch (error) {
                console.error('Error al obtener las carreras:', error);
            }
        };
        fetchCarreras();
    }, []);

    return (
        <div>
            <h1>Lista de Carreras</h1>
            <Link to="/carreras/new">Crear Nueva Carrera</Link>
            <ul>
                {carreras.map(carrera => (
                    <li key={carrera.id_carrera}>
                        {carrera.nombre_carrera}
                        <Link to={`/carreras/edit/${carrera.id_carrera}`}>Editar</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CarreraList;
