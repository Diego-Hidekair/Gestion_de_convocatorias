// src/components/FacultadForm.js
import React, { useState } from 'react';
import axios from 'axios';



const FacultadForm = () => {
    const [nombre_facultad, setNombreFacultad] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/facultades', { nombre_facultad });
            console.log(response.data);
        } catch (error) {
            console.error('Error al crear la facultad:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <label>
                Nombre Facultad:
                <input
                    type="text"
                    value={nombre_facultad}
                    onChange={(e) => setNombreFacultad(e.target.value)}
                />
            </label>
            <button type="submit">Guardar</button>
        </form>
    );
};

export default FacultadForm;
/*function FacultadForm() {
    const [nombre_facultad, setNombreFacultad] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/facultades', { nombre_facultad });
            alert('Facultad creada exitosamente');
            setNombreFacultad('');
        } catch (error) {
            alert('Error al crear facultad: ' + error.message);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <label>
                Nombre Facultad:
                <input type="text" value={nombre_facultad} onChange={(e) => setNombreFacultad(e.target.value)} required />
            </label>
            <button type="submit">Guardar</button>
        </form>
    );
}

export default FacultadForm;
*/