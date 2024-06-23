// frontend/components/TipoconvocatoriaForm.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const TipoconvocatoriaEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tipoConvocatoria, setTipoConvocatoria] = useState({
        Nombre_convocatoria: '',
        Cod_facultad: '',
        Cod_carrera: ''
    });
    const [facultades, setFacultades] = useState([]);
    const [carreras, setCarreras] = useState([]);

    useEffect(() => {
        const fetchTipoConvocatoria = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/tipos-convocatorias/${id}`);
                setTipoConvocatoria(response.data);
            } catch (error) {
                console.error('Error al obtener el tipo de convocatoria:', error);
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

        const fetchCarreras = async () => {
            try {
                const response = await axios.get('http://localhost:5000/carreras');
                setCarreras(response.data);
            } catch (error) {
                console.error('Error al obtener las carreras:', error);
            }
        };

        fetchTipoConvocatoria();
        fetchFacultades();
        fetchCarreras();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTipoConvocatoria({ ...tipoConvocatoria, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:5000/tipos-convocatorias/${id}`, tipoConvocatoria);
            navigate('/tipoconvocatorias');
        } catch (error) {
            console.error('Error al actualizar tipo de convocatoria:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <label>
                Nombre de Convocatoria:
                <input
                    type="text"
                    name="Nombre_convocatoria"
                    value={tipoConvocatoria.Nombre_convocatoria}
                    onChange={handleChange}
                />
            </label>
            <label>
                Facultad:
                <select
                    name="Cod_facultad"
                    value={tipoConvocatoria.Cod_facultad}
                    onChange={handleChange}
                >
                    {facultades.map((facultad) => (
                        <option key={facultad.id_facultad} value={facultad.id_facultad}>
                            {facultad.Nombre_facultad}
                        </option>
                    ))}
                </select>
            </label>
            <label>
                Carrera:
                <select
                    name="Cod_carrera"
                    value={tipoConvocatoria.Cod_carrera}
                    onChange={handleChange}
                >
                    {carreras.map((carrera) => (
                        <option key={carrera.id_carrera} value={carrera.id_carrera}>
                            {carrera.Nombre_carrera}
                        </option>
                    ))}
                </select>
            </label>
            <button type="submit">Actualizar Tipo de Convocatoria</button>
        </form>
    );
};

export default TipoconvocatoriaEdit;

