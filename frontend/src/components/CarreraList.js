// src/components/CarreraList.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles.css';

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

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/carreras/${id}`);
            setCarreras(carreras.filter(carrera => carrera.id_carrera !== id));
        } catch (error) {
            console.error('Error al eliminar la carrera:', error);
        }
    };
    
    return (
        <div className="container">
            <h1>Lista de Carreras</h1>
            <Link to="/carreras/new">Crear Nueva Carrera</Link>
            <ul>
                {carreras.map(carrera => (
                    <li key={carrera.id_carrera}>
                        {carrera.nombre_carrera}
                        <div>
                            <Link to={`/carreras/edit/${carrera.id_carrera}`}>Editar</Link>
                            <button onClick={() => handleDelete(carrera.id_carrera)}>Eliminar</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CarreraList;
