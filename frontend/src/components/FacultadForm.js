// src/components/FacultadForm.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const FacultadForm = ({ isOpen }) => { // Recibe la prop isOpen
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
        <div className={`facultad-list-container ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}> {/* Contenedor que se adapta al sidebar */}
            <h1 className="facultad-list-my-4">Crear Nueva Facultad</h1>
            <form onSubmit={handleSubmit}>
                <div className="facultad-list-mb-3">
                    <label htmlFor="nombre_facultad" className="facultad-list-form-label">Nombre:</label>
                    <input
                        type="text"
                        id="nombre_facultad"
                        name="nombre_facultad"
                        className="facultad-list-form-control"
                        value={facultad.nombre_facultad}
                        onChange={handleChange}
                    />
                </div>
                <button type="submit" className="facultad-list-btn facultad-list-btn-primary">Crear Facultad</button>
            </form>
        </div>
    );
};

export default FacultadForm;
