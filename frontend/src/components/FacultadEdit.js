import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const FacultadEdit = () => {
    const { id } = useParams();
    const [nombre_facultad, setNombreFacultad] = useState('');

    useEffect(() => {
        const fetchFacultad = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/facultades/${id}`);
                setNombreFacultad(response.data.nombre_facultad);
            } catch (error) {
                console.error('Error al obtener la facultad:', error);
            }
        };

        fetchFacultad();
    }, [id]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.put(`http://localhost:5000/api/facultades/${id}`, { nombre_facultad });
            console.log(response.data);
        } catch (error) {
            console.error('Error al editar la facultad:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <label>
                Nombre Facultad:
                <input
                    type="text"
                    value={nombre_facultad}
                    onChange={(e) => setNombreFacultad(e.target.value)}
                />
            </label>
            <button type="submit">Guardar</button>
        </form>
    );
};

export default FacultadEdit;
