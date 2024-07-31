// frontend/src/components/ConvocatoriaMateriasList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ConvocatoriaMateriasList = () => {
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
        <div className="container">
            <h2>Lista de Convocatorias</h2>
            <ul>
                {convocatorias.map((convocatoria) => (
                    <li key={convocatoria.id_convocatoria}>
                        {convocatoria.nombre}
                        <Link to={`/convocatorias/${convocatoria.id_convocatoria}/materias`}>Ver Materias</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ConvocatoriaMateriasList;
