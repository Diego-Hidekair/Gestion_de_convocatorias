// src/components/TipoconvocatoriaForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles.css';

const TipoconvocatoriaForm = () => {
    const navigate = useNavigate();
    const [tipoConvocatoria, setTipoConvocatoria] = useState({
        nombre_convocatoria: '',
        cod_carrera: '',
        cod_facultad: ''
    });
    const [facultades, setFacultades] = useState([]);
    const [carreras, setCarreras] = useState([]);

    useEffect(() => {
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

        fetchFacultades();
        fetchCarreras();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTipoConvocatoria({ ...tipoConvocatoria, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        // Validar que todos los campos requeridos estén presentes
        if (!tipoConvocatoria.nombre_convocatoria || !tipoConvocatoria.cod_facultad || !tipoConvocatoria.cod_carrera) {
            alert("Por favor, complete todos los campos.");
            return;
        }
    
        // Validar que los códigos de facultad y carrera sean numéricos
        if (isNaN(tipoConvocatoria.cod_facultad) || isNaN(tipoConvocatoria.cod_carrera)) {
            alert("Por favor, seleccione valores válidos para facultad y carrera.");
            return;
        }
    
        try {
            // Realizar la solicitud POST al backend
            await axios.post('http://localhost:5000/tipo-convocatorias', {
                Nombre_convocatoria: tipoConvocatoria.nombre_convocatoria,
                Cod_facultad: tipoConvocatoria.cod_facultad,
                Cod_carrera: tipoConvocatoria.cod_carrera
            });
            navigate('/tipoconvocatorias');
        } catch (error) {
            console.error('Error al crear tipo de convocatoria:', error);
        }
    };

    return (
        <div className="container">
            <h1>Crear Nuevo Tipo de Convocatoria</h1>
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
                        {facultades.map(facultad => (
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
                        {carreras.map(carrera => (
                            <option key={carrera.id_carrera} value={carrera.id_carrera}>
                                {carrera.nombre_carrera}
                            </option>
                        ))}
                    </select>
                </label>
                <button type="submit">Crear Tipo de Convocatoria</button>
            </form>
        </div>
    );
};

export default TipoconvocatoriaForm;