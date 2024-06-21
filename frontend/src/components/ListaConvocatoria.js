import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ListaConvocatoria = () => {
    const [convocatorias, setConvocatorias] = useState([]);

    useEffect(() => {
        const fetchConvocatorias = async () => {
            const res = await axios.get('http://localhost:5000/api/convocatorias');
            setConvocatorias(res.data);
        };
        fetchConvocatorias();
    }, []);

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/convocatorias/${id}`);
            setConvocatorias(convocatorias.filter(convocatoria => convocatoria.id_convocatoria !== id));
        } catch (error) {
            console.error('Error al eliminar la convocatoria:', error);
        }
    };

    return (
        <div>
            <h2>Lista de Convocatorias</h2>
            <ul>
                {convocatorias.map(convocatoria => (
                    <li key={convocatoria.id_convocatoria}>
                        {convocatoria.nombre} - {convocatoria.fecha_inicio} a {convocatoria.fecha_fin}
                        <Link to={`/convocatorias/editar/${convocatoria.id_convocatoria}`}>Editar</Link>
                        <button onClick={() => handleDelete(convocatoria.id_convocatoria)}>Eliminar</button>
                    </li>
                ))}
            </ul>
            <Link to="/convocatorias/nueva">Crear Convocatoria</Link>
        </div>
    );
};

export default ListaConvocatoria;
