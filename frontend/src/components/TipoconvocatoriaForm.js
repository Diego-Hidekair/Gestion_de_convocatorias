// frontend/components/TipoconvocatoriaForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const TipoconvocatoriaForm = () => {
    const [nombreConvocatoria, setNombreConvocatoria] = useState('');
    const [facultades, setFacultades] = useState([]);
    const [carreras, setCarreras] = useState([]);
    const [selectedFacultad, setSelectedFacultad] = useState('');
    const [selectedCarrera, setSelectedCarrera] = useState('');
    const navigate = useNavigate();

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/tipos-convocatorias/tipo_convocatorias', {
                nombre_convocatoria: nombreConvocatoria,
                cod_facultad: selectedFacultad,
                cod_carrera: selectedCarrera,
            });
            console.log('Tipo de convocatoria creada:', response.data);
            navigate('/tipoconvocatorias'); // Redirigir a la página de listado de convocatorias
        } catch (error) {
            console.error('Error al crear tipo de convocatoria:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <label>
                Nombre de Convocatoria:
                <input
                    type="text"
                    value={nombreConvocatoria}
                    onChange={(e) => setNombreConvocatoria(e.target.value)}
                />
            </label>
            <label>
                Facultad:
                <select
                    value={selectedFacultad}
                    onChange={(e) => setSelectedFacultad(e.target.value)}
                >
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
                    value={selectedCarrera}
                    onChange={(e) => setSelectedCarrera(e.target.value)}
                >
                    {carreras.map((carrera) => (
                        <option key={carrera.id_carrera} value={carrera.id_carrera}>
                            {carrera.nombre_carrera}
                        </option>
                    ))}
                </select>
            </label>
            <button type="submit">Crear Tipo de Convocatoria</button>
        </form>
    );
};

export default TipoconvocatoriaForm;
