// frontend/src/components/ConvocatoriaList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const ConvocatoriaList = () => {
    const [convocatorias, setConvocatorias] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchConvocatorias = async () => {
            try {
                const response = await axios.get('http://localhost:5000/convocatorias');
                setConvocatorias(response.data);
            } catch (error) {
                console.error('Error fetching convocatorias:', error);
            }
        };

        fetchConvocatorias();
    }, []);
    
    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/convocatorias/${id}`);
            setConvocatorias(convocatorias.filter(convocatoria => convocatoria.id_convocatoria !== id));
        } catch (error) {
            console.error('Error deleting convocatoria:', error);
        }
    };

    return (
        <div className="container">
            <h2>Convocatorias</h2>
            <Link to="/convocatorias/new">Crear Nueva Convocatoria</Link>
            <ul>
                {convocatorias.map(convocatoria => (
                    <li key={convocatoria.id_convocatoria}>
                        {convocatoria.cod_convocatoria} - {convocatoria.nombre}
                        <button onClick={() => navigate(`/convocatorias/edit/${convocatoria.id_convocatoria}`)}>Editar</button>
                        <button onClick={() => handleDelete(convocatoria.id_convocatoria)}>Eliminar</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ConvocatoriaList;