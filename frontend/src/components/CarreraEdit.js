// frontend/src/components/CarreraEdit.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const CarreraEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [carrera, setCarrera] = useState({ nombre_carrera: '', cod_facultad: '' });
    const [facultades, setFacultades] = useState([]);

    useEffect(() => {
        const fetchCarrera = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/carreras/${id}`);
                setCarrera(response.data);
            } catch (error) {
                console.error('Error al obtener la carrera:', error);
            }
        };

        const fetchFacultades = async () => {
            try {
                const response = await axios.get('http://localhost:5000/facultades');
                setFacultades(response.data);
            } catch (error) {
                console.error('Error al obtener las facultades:', error);
            }
        };

        fetchCarrera();
        fetchFacultades();
    }, [id]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setCarrera({ ...carrera, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:5000/carreras/${id}`, carrera);
            navigate('/carreras');
        } catch (error) {
            console.error('Error al actualizar carrera:', error);
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
                <select
                    name="cod_facultad"
                    value={carrera.cod_facultad}
                    onChange={handleChange}
                >
                    <option value="">Seleccione una facultad</option>
                    {facultades.map(facultad => (
                        <option key={facultad.cod_facultad} value={facultad.cod_facultad}>
                            {facultad.nombre}
                        </option>
                    ))}
                </select>
            </label>
            <button type="submit">Actualizar Carrera</button>
        </form>
    );
};

export default CarreraEdit;
