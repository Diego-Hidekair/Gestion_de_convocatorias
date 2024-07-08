// src/components/ConvocatoriaForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ConvocatoriaForm = () => {
    const [formData, setFormData] = useState({
        cod_convocatoria: '',
        nombre: '',
        fechaInicio: '',
        fechaFin: '',
        tipoConvocatoria: '',
        carrera: '',
        facultad: '',
        creadoPor: 'Admin'
    });
    const [tiposConvocatoria, setTiposConvocatoria] = useState([]);
    const [carreras, setCarreras] = useState([]);
    const [facultades, setFacultades] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const tiposResponse = await axios.get('http://localhost:5000/tipoConvocatoria');
                setTiposConvocatoria(tiposResponse.data);
                const carrerasResponse = await axios.get('http://localhost:5000/carreras');
                setCarreras(carrerasResponse.data);
                const facultadesResponse = await axios.get('http://localhost:5000/facultades');
                setFacultades(facultadesResponse.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/convocatorias', formData);
            const convocatoriaId = response.data.id_convocatoria;
            navigate(`/convocatorias_materias/new?convocatoriaId=${convocatoriaId}`); // Redirige a la creación de convocatoria_materia
        } catch (error) {
            console.error('Error al guardar la convocatoria:', error);
        }
    };
   
    return (
        <div className="container">
            <h1>Crear Nueva Convocatoria</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Código de Convocatoria:
                    <input
                        type="text"
                        name="cod_convocatoria"
                        value={formData.cod_convocatoria}
                        onChange={handleChange}
                    />
                </label>
                <label>
                    Nombre:
                    <input
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                    />
                </label>
                <label>
                    Fecha de Inicio:
                    <input
                        type="date"
                        name="fechaInicio"
                        value={formData.fechaInicio}
                        onChange={handleChange}
                    />
                </label>
                <label>
                    Fecha de Fin:
                    <input
                        type="date"
                        name="fechaFin"
                        value={formData.fechaFin}
                        onChange={handleChange}
                    />
                </label>
                <label>
                    Tipo de Convocatoria:
                    <select name="tipoConvocatoria" value={formData.tipoConvocatoria} onChange={handleChange}>
                        <option value="">Seleccione un tipo</option>
                        {tiposConvocatoria.map(tipo => (
                            <option key={tipo.id_tipoconvocatoria} value={tipo.id_tipoconvocatoria}>
                                {tipo.nombre_convocatoria}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    Carrera:
                    <select name="carrera" value={formData.carrera} onChange={handleChange}>
                        <option value="">Seleccione una carrera</option>
                        {carreras.map(carrera => (
                            <option key={carrera.id_carrera} value={carrera.id_carrera}>
                                {carrera.nombre_carrera}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    Facultad:
                    <select name="facultad" value={formData.facultad} onChange={handleChange}>
                        <option value="">Seleccione una facultad</option>
                        {facultades.map(facultad => (
                            <option key={facultad.id_facultad} value={facultad.id_facultad}>
                                {facultad.nombre_facultad}
                            </option>
                        ))}
                    </select>
                </label>
                <button type="submit">Siguiente</button>
            </form>
        </div>
    );
};

export default ConvocatoriaForm;