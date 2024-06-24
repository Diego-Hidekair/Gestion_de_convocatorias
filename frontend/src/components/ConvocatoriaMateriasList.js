// src/components/ConvocatoriaMateriasList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const ConvocatoriaMateriasList = () => {
    const { id_convocatoria } = useParams();
    const [convocatoriaMaterias, setConvocatoriaMaterias] = useState([]);

    useEffect(() => {
        const fetchConvocatoriaMaterias = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/convocatorias/${id_convocatoria}/materias`);
                setConvocatoriaMaterias(response.data);
            } catch (error) {
                console.error('Error al obtener convocatoria_materia:', error);
            }
        };

        fetchConvocatoriaMaterias();
    }, [id_convocatoria]);

    return (
        <div>
            <h1>Materias Asignadas a la Convocatoria</h1>
            <ul>
                {convocatoriaMaterias.map((convocatoriaMateria) => (
                    <li key={convocatoriaMateria.id}>
                        Materia ID: {convocatoriaMateria.id_materia}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ConvocatoriaMateriasList;
