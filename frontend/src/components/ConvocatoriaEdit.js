// frontend/src/components/ConvocatoriaEdit.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const ConvocatoriaEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [convocatoria, setConvocatoria] = useState({
        cod_convocatoria: '',
        nombre: '',
        fecha_inicio: '',
        fecha_fin: '',
        id_tipoconvocatoria: '',
        id_carrera: '',
        id_facultad: ''
    });

    const [tiposConvocatoria, setTiposConvocatoria] = useState([]);
    const [carreras, setCarreras] = useState([]);
    const [facultades, setFacultades] = useState([]);

    useEffect(() => {
        const fetchConvocatoria = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/convocatorias/${id}`);
                setConvocatoria(response.data);
            } catch (error) {
                console.error('Error fetching convocatoria:', error);
            }
        };

        const fetchTiposConvocatoria = async () => {
            try {
                const response = await axios.get('http://localhost:5000/tipo-convocatorias');
                setTiposConvocatoria(response.data);
            } catch (error) {
                console.error('Error fetching tipos de convocatoria:', error);
            }
        };

        const fetchCarreras = async () => {
            try {
                const response = await axios.get('http://localhost:5000/carreras');
                setCarreras(response.data);
            } catch (error) {
                console.error('Error fetching carreras:', error);
            }
        };

        const fetchFacultades = async () => {
            try {
                const response = await axios.get('http://localhost:5000/facultades');
                setFacultades(response.data);
            } catch (error) {
                console.error('Error fetching facultades:', error);
            }
        };

        fetchConvocatoria();
        fetchTiposConvocatoria();
        fetchCarreras();
        fetchFacultades();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setConvocatoria((prevConvocatoria) => ({
            ...prevConvocatoria,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:5000/convocatorias/${id}`, convocatoria);
            navigate('/convocatorias');
        } catch (error) {
            console.error('Error updating convocatoria:', error);
        }
    };

    return (
        <div className="container">
            <h2>Editar Convocatoria</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Código:
                    <input
                        type="text"
                        name="cod_convocatoria"
                        value={convocatoria.cod_convocatoria}
                        onChange={handleChange}
                        required
                    />
                </label>
                <br />
                <label>
                    Nombre:
                    <input
                        type="text"
                        name="nombre"
                        value={convocatoria.nombre}
                        onChange={handleChange}
                        required
                    />
                </label>
                <br />
                <label>
                    Fecha de Inicio:
                    <input
                        type="date"
                        name="fecha_inicio"
                        value={convocatoria.fecha_inicio ? convocatoria.fecha_inicio.split('T')[0] : ''}
                        onChange={handleChange}
                        required
                    />
                </label>
                <br />
                <label>
                    Fecha de Fin:
                    <input
                        type="date"
                        name="fecha_fin"
                        value={convocatoria.fecha_fin ? convocatoria.fecha_fin.split('T')[0] : ''}
                        onChange={handleChange}
                    />
                </label>
                <br />
                <label>
                    Tipo de Convocatoria:
                    <select
                        name="id_tipoconvocatoria"
                        value={convocatoria.id_tipoconvocatoria}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Seleccione un tipo de convocatoria</option>
                        {tiposConvocatoria.map((tipo) => (
                            <option key={tipo.id_tipoconvocatoria} value={tipo.id_tipoconvocatoria}>
                                {tipo.nombre_convocatoria}
                            </option>
                        ))}
                    </select>
                </label>
                <br />
                <label>
                    Carrera:
                    <select
                        name="id_carrera"
                        value={convocatoria.id_carrera}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Seleccione una carrera</option>
                        {carreras.map((carrera) => (
                            <option key={carrera.id_carrera} value={carrera.id_carrera}>
                                {carrera.nombre_carrera}
                            </option>
                        ))}
                    </select>
                </label>
                <br />
                <label>
                    Facultad:
                    <select
                        name="id_facultad"
                        value={convocatoria.id_facultad}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Seleccione una facultad</option>
                        {facultades.map((facultad) => (
                            <option key={facultad.id_facultad} value={facultad.id_facultad}>
                                {facultad.nombre_facultad}
                            </option>
                        ))}
                    </select>
                </label>
                <br />
                <button type="submit">Actualizar</button>
            </form>
        </div>
    );
};

export default ConvocatoriaEdit;
