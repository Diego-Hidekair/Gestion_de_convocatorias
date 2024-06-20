// src/components/ConvocatoriaList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ConvocatoriaList = () => {
    const [convocatorias, setConvocatorias] = useState([]);

    useEffect(() => {
        const fetchConvocatorias = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/convocatorias');
                setConvocatorias(response.data);
            } catch (error) {
                console.error('Error al obtener las convocatorias:', error);
            }
        };

        fetchConvocatorias();
    }, []);

    return (
        <div>
            <h2>Lista de Convocatorias</h2>
            <ul>
                {convocatorias.map((convocatoria) => (
                    <li key={convocatoria.cod_convocatoria}>
                        {convocatoria.nombre_convocatoria} 
                        <Link to={`/convocatorias/editar/${convocatoria.cod_convocatoria}`}>Editar</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ConvocatoriaList;
