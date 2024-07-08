// frontend/src/components/ConvocatoriaList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ConvocatoriaList = () => {
    const [convocatorias, setConvocatorias] = useState([]);

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

    return (
        <div className="container">
            <h2>Convocatorias</h2>
            <Link to="/convocatorias/new">Crear Nueva Convocatoria</Link>
            <ul>
                {convocatorias.map(convocatoria => (
                    <li key={convocatoria.id_convocatoria}>
                        <Link to={`/convocatorias/edit/${convocatoria.id_convocatoria}`}>
                            {convocatoria.cod_convocatoria} - {convocatoria.nombre}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ConvocatoriaList;
