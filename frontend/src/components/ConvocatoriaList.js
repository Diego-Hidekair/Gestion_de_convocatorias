// src/components/ConvocatoriaList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

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
                {convocatorias.map(convocatoria => (
                    <li key={convocatoria.cod_convocatoria}>{convocatoria.nombre_convocatoria}</li>
                ))}
            </ul>
        </div>
    );
};

export default ConvocatoriaList;
