// frontend/components/TipoconvocatoriaEdit.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const TipoconvocatoriaEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tipoConvocatoria, setTipoConvocatoria] = useState({
        nombre_convocatoria: '',
        cod_facultad: '',
        cod_carrera: ''
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
                    name="nombre_convocatoria"
                    value={tipoConvocatoria.nombre_convocatoria}
                    onChange={handleChange}
                />
            </label>
            <label>
                Facultad:
                <select
                    name="cod_facultad"
                    value={tipoConvocatoria.cod_facultad}
                    onChange={handleChange}
                >
                    <option value="">Seleccione una facultad</option>
                    {facultades.map((facultad) => (
                        <option key={facultad.id_facultad} value={facultad.id_facultad}>
                            {facultad.nombre_facultad}
                        </option>
                    ))}
                </select>
            </label>
            <label>
                Carrera:
                <select
                    name="cod_carrera"
                    value={tipoConvocatoria.cod_carrera}
                    onChange={handleChange}
                >
                    <option value="">Seleccione una carrera</option>
                    {carreras.map((carrera) => (
                        <option key={carrera.id_carrera} value={carrera.id_carrera}>
                            {carrera.nombre_carrera}
                        </option>
                    ))}
                </select>
            </label>
            <button type="submit">Actualizar Tipo de Convocatoria</button>
        </form>
    );
};

export default TipoconvocatoriaEdit;

