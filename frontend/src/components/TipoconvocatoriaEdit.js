// src/components/TipoconvocatoriaEdit.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles.css';

const TipoconvocatoriaEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tipoConvocatoria, setTipoConvocatoria] = useState({ Nombre_convocatoria: '', Cod_carrera: '', Cod_facultad: '' });
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

        const fetchTipoConvocatoria = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/tipo-convocatorias/${id}`);
                setTipoConvocatoria({
                    Nombre_convocatoria: response.data.Nombre_convocatoria || '',
                    Cod_carrera: response.data.Cod_carrera || '',
                    Cod_facultad: response.data.Cod_facultad || ''
                });
            } catch (error) {
                console.error('Error al obtener el tipo de convocatoria:', error);
            }
        };

        fetchFacultades();
        fetchCarreras();
        fetchTipoConvocatoria();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTipoConvocatoria({ ...tipoConvocatoria, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!tipoConvocatoria.Nombre_convocatoria || !tipoConvocatoria.Cod_facultad || !tipoConvocatoria.Cod_carrera) {
            alert("Por favor, complete todos los campos.");
            return;
        }

        if (isNaN(tipoConvocatoria.Cod_facultad) || isNaN(tipoConvocatoria.Cod_carrera)) {
            alert("Por favor, seleccione valores válidos para facultad y carrera.");
            return;
        }

        console.log('Datos enviados:', tipoConvocatoria); // Log para verificar los datos

        try {
            await axios.put(`http://localhost:5000/tipo-convocatorias/${id}`, tipoConvocatoria);
            navigate('/tipoconvocatorias');
        } catch (error) {
            console.error('Error al actualizar el tipo de convocatoria:', error);
        }
    };
    
    return (
        <div className="container">
            <h1>Editar Tipo de Convocatoria</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Nombre de Convocatoria:
                    <input
                        type="text"
                        name="Nombre_convocatoria"
                        value={tipoConvocatoria.Nombre_convocatoria}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    Facultad:
                    <select
                        name="Cod_facultad"
                        value={tipoConvocatoria.Cod_facultad}
                        onChange={handleChange}
                        required
                    >
                        <option key="" value="">Seleccione una facultad</option>
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
                        name="Cod_carrera"
                        value={tipoConvocatoria.Cod_carrera}
                        onChange={handleChange}
                        required
                    >
                        <option key="" value="">Seleccione una carrera</option>
                        {carreras.map(carrera => (
                            <option key={carrera.id_carrera} value={carrera.id_carrera}>
                                {carrera.nombre_carrera}
                            </option>
                        ))}
                    </select>
                </label>
                <button type="submit">Actualizar Tipo de Convocatoria</button>
            </form>
        </div>
    );
};

export default TipoconvocatoriaEdit;