// src/components/ConvocatoriaList.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ConvocatoriaList = () => {
    const [convocatorias, setConvocatorias] = useState([]);

    useEffect(() => {
        const fetchConvocatorias = async () => {
            try {
                const response = await axios.get('http://localhost:5000/convocatorias');
                setConvocatorias(response.data);
            } catch (error) {
                console.error('Error al obtener las convocatorias:', error);
            }
        };

        fetchConvocatorias();
    }, []);

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/convocatorias/${id}`);
            setConvocatorias(convocatorias.filter(convocatoria => convocatoria.id_convocatoria !== id));
        } catch (error) {
            console.error('Error al eliminar la convocatoria:', error);
        }
    };

    return (
        <div className="container">
            <h1>Lista de Convocatorias</h1>
            <Link to="/convocatorias/new">
                <button>Crear Nueva Convocatoria</button>
            </Link>
            <ul>
                {convocatorias.map(convocatoria => (
                    <li key={convocatoria.id_convocatoria}>
                        {convocatoria.nombre} - {convocatoria.fecha_inicio} a {convocatoria.fecha_fin}
                        <button onClick={() => handleDelete(convocatoria.id_convocatoria)}>Eliminar</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ConvocatoriaList;
