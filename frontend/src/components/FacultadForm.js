// src/components/FacultadForm.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

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
            <h1 className="my-4">Crear Nueva Facultad</h1>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="nombre_facultad" className="form-label">Nombre:</label>
                    <input
                        type="text"
                        id="nombre_facultad"
                        name="nombre_facultad"
                        className="form-control"
                        value={facultad.nombre_facultad}
                        onChange={handleChange}
                    />
                </div>
                <button type="submit" className="btn btn-primary">Crear Facultad</button>
            </form>
        </div>
    );
};

export default FacultadForm;