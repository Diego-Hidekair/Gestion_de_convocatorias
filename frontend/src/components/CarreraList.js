// src/components/CarreraList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const CarreraList = () => {
    const [carreras, setCarreras] = useState([]);

    useEffect(() => {
        const fetchCarreras = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/carreras');
                setCarreras(response.data);
            } catch (error) {
                console.error('Error al obtener las carreras:', error);
            }
        };

        fetchCarreras();
    }, []);

    return (
        <div>
            <h2>Lista de Carreras</h2>
            <ul>
                {carreras.map((carrera) => (
                    <li key={carrera.cod_carrera}>
                        {carrera.nombre_carrera} 
                        <Link to={`/carreras/editar/${carrera.cod_carrera}`}>Editar</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CarreraList;
