import React, { useState } from 'react';
import axios from 'axios';

/*
// src/components/ConvocatoriaForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ConvocatoriaForm = () => {
    const [nombreConvocatoria, setNombreConvocatoria] = useState('');
    const [codFacultad, setCodFacultad] = useState('');
    const [codCarrera, setCodCarrera] = useState('');
    const [facultades, setFacultades] = useState([]);
    const [carreras, setCarreras] = useState([]);

    useEffect(() => {
        const fetchFacultades = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/facultades');
                setFacultades(response.data);
            } catch (err) {
                console.error(err);
            }
        };

        const fetchCarreras = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/carreras');
                setCarreras(response.data);
            } catch (err) {
                console.error(err);
            }
        };

        fetchFacultades();
        fetchCarreras();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/convocatorias', {
                Nombre_convocatoria: nombreConvocatoria,
                Cod_carrera: codCarrera,
                Cod_facultad: codFacultad
            });
            console.log(response.data);
            setNombreConvocatoria('');
            setCodFacultad('');
            setCodCarrera('');
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Nombre de la Convocatoria:</label>
                <input
                    type="text"
                    value={nombreConvocatoria}
                    onChange={(e) => setNombreConvocatoria(e.target.value)}
                />
            </div>
            <div>
                <label>Facultad:</label>
                <select value={codFacultad} onChange={(e) => setCodFacultad(e.target.value)}>
                    <option value="">Seleccione una facultad</option>
                    {facultades.map((facultad) => (
                        <option key={facultad.Cod_facultad} value={facultad.Cod_facultad}>
                            {facultad.Nombre_facultad}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label>Carrera:</label>
                <select value={codCarrera} onChange={(e) => setCodCarrera(e.target.value)}>
                    <option value="">Seleccione una carrera</option>
                    {carreras.map((carrera) => (
                        <option key={carrera.Cod_carrera} value={carrera.Cod_carrera}>
                            {carrera.Nombre_carrera}
                        </option>
                    ))}
                </select>
            </div>
            <button type="submit">Crear Convocatoria</button>
        </form>
    );
};

export default ConvocatoriaForm;
*/
function ConvocatoriaForm() {
    const [nombre_convocatoria, setNombreConvocatoria] = useState('');
    const [cod_carrera, setCodCarrera] = useState('');
    const [cod_facultad, setCodFacultad] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/convocatorias', { nombre_convocatoria, cod_carrera, cod_facultad });
            alert('Convocatoria creada exitosamente');
            setNombreConvocatoria('');
            setCodCarrera('');
            setCodFacultad('');
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
                Código Carrera:
                <input type="number" value={cod_carrera} onChange={(e) => setCodCarrera(e.target.value)} required />
            </label>
            <label>
                Código Facultad:
                <input type="number" value={cod_facultad} onChange={(e) => setCodFacultad(e.target.value)} required />
            </label>
            <button type="submit">Guardar</button>
        </form>
    );
}

export default ConvocatoriaForm;
