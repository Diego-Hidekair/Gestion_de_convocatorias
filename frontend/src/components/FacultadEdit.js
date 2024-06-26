// src/components/FacultadEdit.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles.css';

const FacultadEdit = () => {
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
        <div className="container">
            <h1>Editar Facultad</h1>
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
                <button type="submit">Actualizar Facultad</button>
            </form>
        </div>
    );
};

export default FacultadEdit;