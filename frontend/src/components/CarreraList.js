// frontend/src/components/CarreraList.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

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
            <h1 className="my-4">Lista de Carreras</h1>
            <Link to="/carreras/new" className="btn btn-primary mb-3">Crear Nueva Carrera</Link>
            <ul className="list-group">
                {carreras.map(carrera => (
                    <li key={carrera.id_carrera} className="list-group-item d-flex justify-content-between align-items-center">
                        {carrera.nombre_carrera}
                        <div>
                            <Link to={`/carreras/edit/${carrera.id_carrera}`} className="btn btn-warning btn-sm me-2">Editar</Link>
                            <button onClick={() => handleDelete(carrera.id_carrera)} className="btn btn-danger btn-sm">Eliminar</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CarreraList;
