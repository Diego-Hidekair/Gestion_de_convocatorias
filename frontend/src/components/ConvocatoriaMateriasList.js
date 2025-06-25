// frontend/src/components/ConvocatoriaMateriasList.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../config/axiosConfig'; 

const ConvocatoriaMateriasList = () => {
    const [convocatorias, setConvocatorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchConvocatorias = async () => {
            try {
                const response = await api.get('/convocatorias');
                setConvocatorias(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error al obtener las convocatorias:', error);
                setError('Error al obtener convocatorias');
                setLoading(false);
            }
        };

        fetchConvocatorias();
    }, []);

    const handleDelete = async (id_convocatoria) => {
        try {
            await api.delete(`/convocatorias/${id_convocatoria}`);
            setConvocatorias(convocatorias.filter(c => c.id_convocatoria !== id_convocatoria));
        } catch (error) {
            console.error('Error deleting convocatoria:', error);
        }
    };

    if (loading) return <p>Cargando convocatorias...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="container-conv-mat">
            <h2>Lista de Convocatorias</h2>
            <ul>
                {convocatorias.map((convocatoria) => (
                    <li key={convocatoria.id_convocatoria}>
                        {convocatoria.nombre} {' '}
                        <Link to={`/convocatorias/${convocatoria.id_convocatoria}/materias`}>Ver Materias</Link> {' '}
                        <button onClick={() => handleDelete(convocatoria.id_convocatoria)}>Eliminar</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ConvocatoriaMateriasList;
