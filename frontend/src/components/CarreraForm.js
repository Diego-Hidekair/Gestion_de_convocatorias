// frontend/src/components/CarreraForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles.css';

const CarreraForm = () => {
    const navigate = useNavigate();
    const [carrera, setCarrera] = useState({ nombre_carrera: '', cod_facultad: '' });
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCarrera({ ...carrera, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/carreras', carrera);
            navigate('/carreras');
        } catch (error) {
            console.error('Error al crear carrera:', error);
        }
    };

    return (
        <div className="container">
            <h1>Crear Nueva Carrera</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Nombre:
                    <input
                        type="text"
                        name="nombre_carrera"
                        value={carrera.nombre_carrera}
                        onChange={handleChange}
                    />
                </label>
                <label>
                    Facultad:
                    <select
                        name="cod_facultad"
                        value={carrera.cod_facultad}
                        onChange={handleChange}
                    >
                        <option key="" value="">Seleccione una facultad</option>
                        {facultades.map(facultad => (
                            <option key={facultad.id_facultad} value={facultad.id_facultad}>
                                {facultad.nombre_facultad}
                            </option>
                        ))}
                    </select>
                </label>
                <button type="submit">Crear Carrera</button>
            </form>
        </div>
    );
};

export default CarreraForm;