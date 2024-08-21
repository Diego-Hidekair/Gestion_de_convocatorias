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

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/convocatorias/${id}`);
            setConvocatorias(convocatorias.filter(convocatoria => convocatoria.id_convocatoria !== id));
        } catch (error) {
            console.error('Error deleting convocatoria:', error);
        }
    };

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Lista de Convocatorias</h2>
            <Link to="/convocatorias/crear" className="btn btn-success mb-3">Crear Nueva Convocatoria</Link>
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>Código</th>
                        <th>Nombre</th>
                        <th>Fecha de Inicio</th>
                        <th>Fecha de Fin</th>
                    </tr>
                </thead>
                <tbody>
                    {convocatorias.map((convocatoria) => (
                        <tr key={convocatoria.id_convocatoria}>
                            <td>{convocatoria.cod_convocatoria}</td>
                            <td>{convocatoria.nombre}</td>
                            <td>{new Date(convocatoria.fecha_inicio).toLocaleDateString()}</td>
                            <td>{new Date(convocatoria.fecha_fin).toLocaleDateString()}</td>
                            <td>{convocatoria.nombre_tipoconvocatoria}</td>
                            <td>{convocatoria.nombre_carrera}</td>
                            <td>{convocatoria.nombre_facultad}</td>
                            <td>
                                <Link to={`/convocatorias/${convocatoria.id_convocatoria}/editar`} className="btn btn-primary btn-sm me-2">Editar</Link>
                                <button onClick={() => handleDelete(convocatoria.id_convocatoria)} className="btn btn-danger btn-sm">Eliminar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ConvocatoriaList;
