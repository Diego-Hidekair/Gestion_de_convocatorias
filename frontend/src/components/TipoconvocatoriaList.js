// frontend/components/TipoconvocatoriaList.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const TipoconvocatoriaList = () => {
    const [tiposConvocatoria, setTiposConvocatoria] = useState([]);

    useEffect(() => {
        const fetchTiposConvocatoria = async () => {
            try {
                const response = await axios.get('http://localhost:5000/tipos-convocatorias');
                setTiposConvocatoria(response.data);
            } catch (error) {
                console.error('Error al obtener los tipos de convocatoria:', error);
            }
        };
        fetchTiposConvocatoria();
    }, []);

    const handleDelete = async (id) => {
        try {
            const response = await axios.delete(`http://localhost:5000/tipos-convocatorias/${id}`);
            if (response.status === 200) {
                setTiposConvocatoria(tiposConvocatoria.filter((tipo) => tipo.id_tipoconvocatoria !== id));
            }
        } catch (error) {
            console.error('Error al eliminar tipo de convocatoria:', error);
        }
    };


    return (
        <div className="container">
            <h2>Tipos de Convocatoria</h2>
            <Link to="/tipoconvocatorias/new">Crear Tipo de Convocatoria</Link>
            <ul>
                {tiposConvocatoria.map((tipo) => (
                    <li key={tipo.id_tipoconvocatoria}>
                        <strong>Nombre:</strong> {tipo.nombre_convocatoria}<br />
                        <strong>Facultad:</strong> {tipo.nombre_facultad}<br />
                        <strong>Carrera:</strong> {tipo.nombre_carrera}<br />
                        <Link to={`/tipoconvocatorias/edit/${tipo.id_tipoconvocatoria}`}>Editar</Link>
                        <button onClick={() => handleDelete(tipo.id_tipoconvocatoria)}>Eliminar</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TipoconvocatoriaList;