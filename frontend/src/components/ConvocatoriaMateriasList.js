// src/components/ConvocatoriaMateriasList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ConvocatoriaMateriasList = ({ idConvocatoria }) => {
    const [materias, setMaterias] = useState([]);

    useEffect(() => {
        const fetchMaterias = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/convocatoria-materia/${idConvocatoria}`);
                setMaterias(response.data);
            } catch (error) {
                console.error('Error fetching materias:', error);
            }
        };

        fetchMaterias();
    }, [idConvocatoria]);

    const handleDelete = async (idMateria) => {
        try {
            await axios.delete(`http://localhost:5000/convocatoria-materia/${idConvocatoria}/${idMateria}`);
            setMaterias(materias.filter(materia => materia.id !== idMateria));
        } catch (error) {
            console.error('Error deleting materia:', error);
        }
    };

    return (
        <div className='container'>
            <h2>Materias Asociadas</h2>
            <ul>
                {materias.map(materia => (
                    <li key={materia.id}>
                        {materia.nombre} - {materia.codigo} {/* Aquí ajusta según los datos de tu materia */}
                        <button onClick={() => handleDelete(materia.id)}>Eliminar</button>
                    </li>
                    
                ))}
            </ul>
        </div>
    );
};

export default ConvocatoriaMateriasList;

