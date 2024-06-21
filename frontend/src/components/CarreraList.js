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
                console.error('Error al obtener carreras:', error);
            }
        };

        fetchCarreras();
    }, []);
    
    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/carreras/${id}`);
            setCarreras(carreras.filter(carrera => carrera.id_carrera !== id));
        } catch (error) {
            console.error('Error al eliminar la carrera:', error);
        }
    };

    return (
        <div>
            <h2>Lista de Carreras</h2>
            <ul>
                {carreras.map((carrera) => (
                    <li key={carrera.id_carrera}>
                        {carrera.Nombre_carrera} 
                        <Link to={`/carreras/${carrera.id_carrera}/edit`}>Editar</Link>
                        <button onClick={() => handleDelete(carrera.id_carrera)}>Eliminar</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CarreraList;