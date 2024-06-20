import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const CarreraEdit = () => {
    const { id } = useParams();
    const [nombre_carrera, setNombreCarrera] = useState('');
    const [cod_facultad, setCodFacultad] = useState('');

    useEffect(() => {
        const fetchCarrera = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/carreras/${id}`);
                setNombreCarrera(response.data.nombre_carrera);
                setCodFacultad(response.data.cod_facultad);
            } catch (error) {
                console.error('Error al obtener la carrera:', error);
            }
        };

        fetchCarrera();
    }, [id]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.put(`http://localhost:5000/api/carreras/${id}`, { nombre_carrera, cod_facultad });
            console.log(response.data);
        } catch (error) {
            console.error('Error al editar la carrera:', error);
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
                Código Facultad:
                <input
                    type="text"
                    value={cod_facultad}
                    onChange={(e) => setCodFacultad(e.target.value)}
                />
            </label>
            <button type="submit">Guardar</button>
        </form>
    );
};

export default CarreraEdit;
