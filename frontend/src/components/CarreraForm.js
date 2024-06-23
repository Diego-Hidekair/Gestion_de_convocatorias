// frontend/src/components/CarreraForm.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CarreraForm = () => {
    const navigate = useNavigate();
    const [carrera, setCarrera] = useState({ nombre_carrera: '', cod_facultad: '' });

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
                <input
                    type="number"
                    name="cod_facultad"
                    value={carrera.cod_facultad}
                    onChange={handleChange}
                />
            </label>
            <button type="submit">Crear Carrera</button>
        </form>
    );
};

export default CarreraForm;
