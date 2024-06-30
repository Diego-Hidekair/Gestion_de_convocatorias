// src/components/FacultadForm.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles.css';

const FacultadForm = () => {
    const navigate = useNavigate();
    const [facultad, setFacultad] = useState({ nombre_facultad: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFacultad({ ...facultad, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/facultades', facultad);
            navigate('/facultades');
        } catch (error) {
            console.error('Error al crear facultad:', error);
        }
    };

    return (
        <div className="container">
            <h1>Crear Nueva Facultad</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Nombre:
                    <input
                        type="text"
                        name="nombre_facultad"
                        value={facultad.nombre_facultad}
                        onChange={handleChange}
                    />
                </label>
                <button type="submit">Crear Facultad</button>
            </form>
        </div>
    );
};

export default FacultadForm;