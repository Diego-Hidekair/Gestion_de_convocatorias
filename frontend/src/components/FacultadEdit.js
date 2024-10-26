// src/components/FacultadEdit.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const FacultadEdit = ({ isOpen }) => { // Recibe la prop isOpen
    const { id } = useParams();
    const navigate = useNavigate();
    const [facultad, setFacultad] = useState({ nombre_facultad: '' });

    useEffect(() => {
        const fetchFacultad = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/facultades/${id}`);
                setFacultad(response.data);
            } catch (error) {
                console.error('Error al obtener la facultad:', error);
            }
        };
        fetchFacultad();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFacultad({ ...facultad, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:5000/facultades/${id}`, facultad);
            navigate('/facultades');
        } catch (error) {
            console.error('Error al actualizar facultad:', error);
        }
    };

    return (
        <div className={`facultad-list-container ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}> 
            <h1 className="facultad-list-my-4">Editar Facultad</h1>
            <form onSubmit={handleSubmit}>
                <div className="facultad-list-mb-3">
                    <label htmlFor="nombre_facultad" className="form-label">Nombre:</label>
                    <input
                        type="text"
                        id="nombre_facultad"
                        name="nombre_facultad"
                        className="facultad-list-form-control"
                        value={facultad.nombre_facultad}
                        onChange={handleChange}
                    />
                </div>
                <button type="submit" className="facultad-list-btn facultad-list-btn-primary">Actualizar Facultad</button>
            </form>
        </div>
    );
};

export default FacultadEdit;
