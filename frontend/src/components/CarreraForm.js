// frontend/src/components/CarreraForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function CarreraForm() {
    const [nombre_carrera, setNombreCarrera] = useState('');
    const [cod_facultad, setCodFacultad] = useState('');
    const [facultades, setFacultades] = useState([]);

    useEffect(() => {
        const fetchFacultades = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/facultades');
                setFacultades(response.data);
            } catch (error) {
                console.error('Error al obtener facultades:', error);
            }
        };
        fetchFacultades();
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/carreras', { nombre_carrera, cod_facultad });
            alert('Carrera creada exitosamente');
            setNombreCarrera('');
            setCodFacultad('');
        } catch (error) {
            alert('Error al crear carrera: ' + error.message);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <label>
                Nombre Carrera:
                <input type="text" value={nombre_carrera} onChange={(e) => setNombreCarrera(e.target.value)} required />
            </label>
            <label>
                Facultad:
                <select value={cod_facultad} onChange={(e) => setCodFacultad(e.target.value)} required>
                    <option value="">Seleccione una facultad</option>
                    {facultades.map((facultad) => (
                        <option key={facultad.cod_facultad} value={facultad.cod_facultad}>
                            {facultad.nombre_facultad}
                        </option>
                    ))}
                </select>
            </label>
            <button type="submit">Guardar</button>
        </form>
    );
}

export default CarreraForm;
