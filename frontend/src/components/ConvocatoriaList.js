// frontend/src/components/ConvocatoriaList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ConvocatoriaList = () => {
    const [convocatorias, setConvocatorias] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchBy, setSearchBy] = useState('');

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

    const handlePreview = (convocatoria) => {
        const pdfFileName = `N_${convocatoria.cod_convocatoria}_${convocatoria.nombre.replace(/\s+/g, '_')}.pdf`;
        const pdfUrl = `http://localhost:5000/pdfs/${pdfFileName}`;
        window.open(pdfUrl, '_blank');
    };

    const handleDownload = (convocatoria) => {
        const pdfFileName = `N_${convocatoria.cod_convocatoria}_${convocatoria.nombre.replace(/\s+/g, '_')}.pdf`;
        const pdfUrl = `http://localhost:5000/pdfs/${pdfFileName}`;
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.setAttribute('download', pdfFileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredConvocatorias = convocatorias.filter(convocatoria => {
        if (!searchBy) return true;
        const value = convocatoria[searchBy]?.toString().toLowerCase();
        return value?.includes(searchTerm.toLowerCase());
    });

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Lista de Convocatorias</h2>
            <Link to="/convocatorias/crear" className="btn btn-success mb-3">Crear Nueva Convocatoria</Link>

            <div className="mb-3">
                <select
                    className="form-select"
                    value={searchBy}
                    onChange={(e) => setSearchBy(e.target.value)}
                >
                    <option value="">Buscar por...</option>
                    <option value="cod_convocatoria">Código</option>
                    <option value="nombre">Nombre</option>
                    <option value="fecha_inicio">Fecha de Inicio</option>
                    <option value="fecha_fin">Fecha de Fin</option>
                    <option value="nombre_tipoconvocatoria">Tipo de Convocatoria</option>
                    <option value="nombre_carrera">Carrera</option>
                    <option value="nombre_facultad">Facultad</option>
                </select>
            </div>
            <input
                type="text"
                className="form-control mb-3"
                placeholder={`Buscar por ${searchBy ? searchBy.replace('_', ' ') : ''}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={!searchBy}
            />

            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>Código</th>
                        <th>Nombre</th>
                        <th>Fecha de Inicio</th>
                        <th>Fecha de Fin</th>
                        <th>Tipo de Convocatoria</th>
                        <th>Carrera</th>
                        <th>Facultad</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredConvocatorias.map((convocatoria) => (
                        <tr key={convocatoria.id_convocatoria}>
                            <td>{convocatoria.cod_convocatoria}</td>
                            <td>{convocatoria.nombre}</td>
                            <td>{new Date(convocatoria.fecha_inicio).toLocaleDateString()}</td>
                            <td>{new Date(convocatoria.fecha_fin).toLocaleDateString()}</td>
                            <td>{convocatoria.nombre_tipoconvocatoria}</td>
                            <td>{convocatoria.nombre_carrera}</td>
                            <td>{convocatoria.nombre_facultad}</td>
                            <td>
                                <button 
                                    onClick={() => handlePreview(convocatoria)} 
                                    className="btn btn-info btn-sm me-2"
                                >
                                    Vista Previa
                                </button>
                                <button 
                                    onClick={() => handleDownload(convocatoria)} 
                                    className="btn btn-primary btn-sm me-2"
                                >
                                    Descargar
                                </button>
                                <Link to={`/convocatorias/${convocatoria.id_convocatoria}/editar`} className="btn btn-warning btn-sm me-2">
                                    Editar
                                </Link>
                                <button 
                                    onClick={() => handleDelete(convocatoria.id_convocatoria)} 
                                    className="btn btn-danger btn-sm"
                                >
                                    Eliminar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ConvocatoriaList;
