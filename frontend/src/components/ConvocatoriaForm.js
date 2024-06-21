// frontend/src/components/ConvocatoriaForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ConvocatoriaForm() {
    const [nombre_convocatoria, setNombreConvocatoria] = useState('');
    const [id_carrera, setIdCarrera] = useState('');
    const [id_facultad, setIdFacultad] = useState('');
    const [facultades, setFacultades] = useState([]);
    const [carreras, setCarreras] = useState([]);

    useEffect(() => {
        const fetchFacultades = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/facultades');
                setFacultades(response.data);
            } catch (error) {
                console.error('Error al obtener facultades:', error);
            }
        };

        const fetchCarreras = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/carreras');
                setCarreras(response.data);
            } catch (error) {
                console.error('Error al obtener carreras:', error);
            }
        };

        fetchFacultades();
        fetchCarreras();
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/convocatorias', { nombre_convocatoria, id_carrera, id_facultad });
            alert('Convocatoria creada exitosamente');
            setNombreConvocatoria('');
            setIdCarrera('');
            setIdFacultad('');
        } catch (error) {
            alert('Error al crear convocatoria: ' + error.message);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <label>
                Nombre Convocatoria:
                <input type="text" value={nombre_convocatoria} onChange={(e) => setNombreConvocatoria(e.target.value)} required />
            </label>
            <label>
                Facultad:
                <select value={id_facultad} onChange={(e) => setIdFacultad(e.target.value)} required>
                    <option value="">Seleccione una facultad</option>
                    {facultades.map((facultad) => (
                        <option key={facultad.id_facultad} value={facultad.id_facultad}>
                            {facultad.Nombre_facultad}
                        </option>
                    ))}
                </select>
            </label>
            <label>
                Carrera:
                <select value={id_carrera} onChange={(e) => setIdCarrera(e.target.value)} required>
                    <option value="">Seleccione una carrera</option>
                    {carreras.map((carrera) => (
                        <option key={carrera.id_carrera} value={carrera.id_carrera}>
                            {carrera.Nombre_carrera}
                        </option>
                    ))}
                </select>
            </label>
            <button type="submit">Guardar</button>
        </form>
    );
}

export default ConvocatoriaForm;
