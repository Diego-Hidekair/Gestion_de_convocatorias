// frontend/src/components/ConvocatoriaMateriasList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

const ConvocatoriaMateriasList = () => {
    const { id_convocatoria } = useParams();
    const [convocatoriaMaterias, setConvocatoriaMaterias] = useState([]);

    useEffect(() => {
        const fetchConvocatoriaMaterias = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/convocatoria-materias/${id_convocatoria}`);
                setConvocatoriaMaterias(response.data);
            } catch (error) {
                console.error('Error fetching convocatoria_materias:', error);
            }
        };

        fetchConvocatoriaMaterias();
    }, [id_convocatoria]);

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/convocatoria-materias/${id}`);
            setConvocatoriaMaterias(convocatoriaMaterias.filter((item) => item.id !== id));
        } catch (error) {
            console.error('Error deleting convocatoria_materia:', error);
        }
    };

    return (
        <div className="container">
            <h2>Materias de la Convocatoria</h2>
            <Link to={`/convocatorias/${id_convocatoria}/materias/new`}>Agregar Materia</Link>
            <ul>
                {convocatoriaMaterias.map((item) => (
                    <li key={item.id}>
                        {item.id_materia}
                        <button onClick={() => handleDelete(item.id)}>Eliminar</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ConvocatoriaMateriasList;
