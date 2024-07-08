// src/components/TipoconvocatoriaList.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles.css';

const TipoconvocatoriaList = () => {
    const [tiposConvocatoria, setTiposConvocatoria] = useState([]);

    useEffect(() => {
        fetchTiposConvocatoria();
    }, []);

    const fetchTiposConvocatoria = async () => {
        try {
            const response = await axios.get('http://localhost:5000/tipo-convocatorias');
            setTiposConvocatoria(response.data);
        } catch (error) {
            console.error('Error al obtener los tipos de convocatoria:', error);
        }
    };
    
    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/tipo-convocatorias/${id}`);
            setTiposConvocatoria(tiposConvocatoria.filter(tipo => tipo.id_tipoconvocatoria !== id));
        } catch (error) {
            console.error('Error al eliminar el tipo de convocatoria:', error);
        }
    };

    return (
        <div className="container">
            <h1>Lista de Tipos de Convocatoria</h1>
            <Link to="/tipoconvocatorias/crear" className="button">
                Crear Nuevo Tipo de Convocatoria
            </Link>
            <ul>
                {tiposConvocatoria.map(tipo => (
                    <li key={tipo.id_tipoconvocatoria}>
                        {tipo.nombre_convocatoria}
                        <Link to={`/tipoconvocatorias/editar/${tipo.id_tipoconvocatoria}`} className="button">
                            Editar
                        </Link>
                        <button onClick={() => handleDelete(tipo.id_tipoconvocatoria)} className="button">
                            Eliminar
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TipoconvocatoriaList;
