// src/components/CarreraList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

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
                {carreras.map(carrera => (
                    <li key={carrera.cod_carrera}>{carrera.nombre_carrera}</li>
                ))}
            </ul>
        </div>
    );
};

export default CarreraList;
