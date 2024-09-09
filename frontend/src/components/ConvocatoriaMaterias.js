// frontend/src/components/ConvocatoriaMaterias.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

const ConvocatoriaMaterias = () => {
    const { id_convocatoria } = useParams();
    const [materias, setMaterias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMaterias = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/convocatoria-materias/${id_convocatoria}`);
                setMaterias(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error al obtener las materias de la convocatoria:', error);
                setError('Error al obtener materias');
                setLoading(false);
            }
        };

        fetchMaterias();
    }, [id_convocatoria]);

    const handleDelete = async (id_materia) => {
        try {
            await axios.delete(`http://localhost:5000/api/convocatoria-materias/${id_materia}`);
            setMaterias(materias.filter((materia) => materia.id_materia !== id_materia));
        } catch (error) {
            console.error('Error al eliminar la materia de la convocatoria:', error);
            setError('Error al eliminar la materia');
        }
    };

    if (loading) return <p>Cargando materias...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="container">
            <h2>Materias de la Convocatoria</h2>
            <Link to={`/convocatorias/${id_convocatoria}/materias/new`}>Agregar Materia</Link>
            <ul>
                {materias.map((materia) => (
                    <li key={materia.id_materia}>
                        {materia.nombre}
                        <button onClick={() => handleDelete(materia.id_materia)}>Eliminar</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ConvocatoriaMaterias;

