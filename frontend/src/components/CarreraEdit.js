import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const CarreraEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [nombre_carrera, setNombreCarrera] = useState('');
    const [id_facultad, setIdFacultad] = useState('');

    useEffect(() => {
        const fetchCarrera = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/carreras/${id}`);
                setNombreCarrera(response.data.Nombre_carrera);
                setIdFacultad(response.data.Cod_facultad);
            } catch (error) {
                console.error('Error al obtener la carrera:', error);
            }
        };

        fetchCarrera();
    }, [id]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            await axios.put(`http://localhost:5000/api/carreras/${id}`, {
                Nombre_carrera: nombre_carrera,
                Cod_facultad: id_facultad
            });
            navigate('/carreras');
        } catch (error) {
            console.error('Error al actualizar carrera:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <label>
                Nombre Carrera:
                <input
                    type="text"
                    value={nombre_carrera}
                    onChange={(e) => setNombreCarrera(e.target.value)}
                />
            </label>
            <label>
                Facultad:
                <input
                    type="text"
                    value={id_facultad}
                    onChange={(e) => setIdFacultad(e.target.value)}
                />
            </label>
            <button type="submit">Actualizar</button>
        </form>
    );
};

export default CarreraEdit;
