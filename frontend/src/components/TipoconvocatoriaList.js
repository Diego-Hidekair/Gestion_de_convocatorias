// src/components/TipoconvocatoriaList.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

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
        <div className="container mt-4">
            <h1 className="mb-4">Lista de Tipos de Convocatoria</h1>
            <Link to="/tipoconvocatorias/crear" className="btn btn-primary mb-3">Crear Nuevo Tipo de Convocatoria</Link>
            <ul className="list-group">
                {tiposConvocatoria.map(tipo => (
                    <li key={tipo.id_tipoconvocatoria} className="list-group-item d-flex justify-content-between align-items-center">
                        {tipo.nombre_convocatoria}
                        <div>
                            <Link to={`/tipoconvocatorias/editar/${tipo.id_tipoconvocatoria}`} className="btn btn-warning btn-sm me-2">Editar</Link>
                            <button onClick={() => handleDelete(tipo.id_tipoconvocatoria)} className="btn btn-danger btn-sm">Eliminar</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TipoconvocatoriaList;
