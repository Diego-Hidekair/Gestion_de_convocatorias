// src/components/TipoconvocatoriaList.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles.css';

const TipoconvocatoriaList = () => {
    const [tipoConvocatorias, setTipoConvocatorias] = useState([]);

    useEffect(() => {
        const fetchTipoConvocatorias = async () => {
            try {
                const response = await axios.get('http://localhost:5000/tipo-convocatorias');
                setTipoConvocatorias(response.data);
            } catch (error) {
                console.error('Error al obtener los tipos de convocatoria:', error);
            }
        };
        fetchTipoConvocatorias();
    }, []);

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/tipo-convocatorias/${id}`);
            setTipoConvocatorias(tipoConvocatorias.filter(tipoConvocatoria => tipoConvocatoria.id_tipoconvocatoria !== id));
        } catch (error) {
            console.error('Error al eliminar el tipo de convocatoria:', error);
        }
    };

    return (
        <div className="container">
            <h1>Lista de Tipos de Convocatoria</h1>
            <Link to="/tipo-convocatorias/new">Crear Nuevo Tipo de Convocatoria</Link>
            <ul>
                {tipoConvocatorias.map(tipoConvocatoria => (
                    <li key={tipoConvocatoria.id_tipoconvocatoria}>
                        {tipoConvocatoria.nombre_convocatoria} - {tipoConvocatoria.nombre_facultad} - {tipoConvocatoria.nombre_carrera}
                        <Link to={`/tipo-convocatorias/edit/${tipoConvocatoria.id_tipoconvocatoria}`}>Editar</Link>
                        <button onClick={() => handleDelete(tipoConvocatoria.id_tipoconvocatoria)}>Eliminar</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TipoconvocatoriaList;
