// frontend/src/components/PDFGenerator.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const PDFGenerator = () => {
    const { id_convocatoria } = useParams();
    const navigate = useNavigate(); // Para la redirección
    const [convocatorias, setConvocatorias] = useState([]);
    const [selectedConvocatoria, setSelectedConvocatoria] = useState(null);
    const [materias, setMaterias] = useState([]);
    const [selectedMaterias, setSelectedMaterias] = useState([]);
    const [resolucion, setResolucion] = useState(null);
    const [dictamen, setDictamen] = useState(null);

    useEffect(() => {
        const fetchConvocatorias = async () => {
            try {
                const response = await axios.get('http://localhost:5000/convocatorias');
                setConvocatorias(response.data);
            } catch (error) {
                console.error('Error al obtener convocatorias:', error);
            }
        };
    
        const fetchMaterias = async () => {
            try {
                const response = await axios.get('http://localhost:5000/materias');
                setMaterias(response.data);
            } catch (error) {
                console.error('Error al obtener materias:', error);
            }
        };

        fetchConvocatorias();
        fetchMaterias();
    }, []);

    useEffect(() => {
        if (id_convocatoria) {
            const fetchSelectedConvocatoria = async () => {
                try {
                    const response = await axios.get(`http://localhost:5000/convocatorias/${id_convocatoria}`);
                    if (response.data) {
                        setSelectedConvocatoria(response.data);
                    } else {
                        console.error('No se encontró la convocatoria con el ID especificado.');
                        setSelectedConvocatoria(null);
                    }
                } catch (error) {
                    console.error('Error al obtener la convocatoria:', error);
                    setSelectedConvocatoria(null);
                }
            };
            fetchSelectedConvocatoria();
        }
    }, [id_convocatoria]);

    const handleConvocatoriaChange = async (e) => {
        const selectedId = e.target.value;
        if (selectedId) {
            try {
                const response = await axios.get(`http://localhost:5000/convocatorias/${selectedId}`);
                setSelectedConvocatoria(response.data);
            } catch (error) {
                console.error('Error al obtener la convocatoria:', error);
            }
        } else {
            setSelectedConvocatoria(null);
        }
    };
    
    const handleMateriaChange = (e) => {
        const selectedMateriaId = parseInt(e.target.value);
        if (!selectedMateriaId) return;
        
        const selectedMateria = materias.find(materia => materia.id_materia === selectedMateriaId);
        if (selectedMateria && !selectedMaterias.some(m => m.id_materia === selectedMateriaId)) {
            setSelectedMaterias(prevSelected => [...prevSelected, selectedMateria]);
        }
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (files.length > 0) {
            if (name === 'resolucion') {
                setResolucion(files[0]);
            } else if (name === 'dictamen') {
                setDictamen(files[0]);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Eliminar duplicados en selectedMaterias
        const uniqueSelectedMaterias = Array.from(new Set(selectedMaterias.map(m => m.id_materia)))
            .map(id => selectedMaterias.find(m => m.id_materia === id));
    
        // Actualizar la tabla convocatoria_materia
        try {
            const promises = uniqueSelectedMaterias.map(materia => {
                return axios.post('http://localhost:5000/convocatoria-materias', {
                    id_convocatoria: selectedConvocatoria.id_convocatoria,
                    id_materia: materia.id_materia
                });
            });
            await Promise.all(promises);
        } catch (error) {
            console.error('Error al vincular materias a la convocatoria:', error);
            return;
        }

        // Generar PDF
        const formData = new FormData();
        formData.append('id_convocatoria', selectedConvocatoria.id_convocatoria);
        formData.append('materias', JSON.stringify(uniqueSelectedMaterias.map(materia => ({
            nombre: materia.nombre,
            codigo: materia.codigo,
        }))));
        
        if (resolucion) {
            formData.append('resolucion', resolucion);
        }
        if (dictamen) {
            formData.append('dictamen', dictamen);
        }

        try {
            const response = await axios.post('http://localhost:5000/pdf/create', formData, {
                responseType: 'blob',
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Redirigir a la vista del PDF
            const pdfFileName = `N_${selectedConvocatoria.cod_convocatoria}_${selectedConvocatoria.nombre.replace(/\s+/g, '_')}.pdf`;
            const url = window.URL.createObjectURL(new Blob([response.data]));
            navigate(`/pdf/view/${pdfFileName}`); // Redirigir a la vista del PDF

        } catch (error) {
            console.error('Error al generar el PDF:', error);
        }
    };
    
    return (
        <div className="container mt-4">
            <h2 className="mb-4">Generar PDF para Convocatoria</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">Seleccionar Convocatoria:</label>
                    <select
                        className="form-select"
                        value={selectedConvocatoria?.id_convocatoria || ''}
                        onChange={handleConvocatoriaChange}
                        required
                    >
                    <option value="">Seleccione una convocatoria</option>
                        {convocatorias.map((convocatoria) => (
                            <option key={convocatoria.id_convocatoria} value={convocatoria.id_convocatoria}>
                                {convocatoria.nombre}
                            </option>
                        ))}
                    </select>
                </div>

                {selectedConvocatoria && (
                    <div className="mt-4">
                        <h4>Detalles de la Convocatoria Seleccionada:</h4>
                        {Object.keys(selectedConvocatoria).map((key) => (
                            <p key={key}><strong>{key}:</strong> {selectedConvocatoria[key]}</p>
                        ))}
                    </div>
                )}

                <div className="mb-3">
                    <label className="form-label">Seleccionar Materia:</label>
                    <select
                        className="form-select"
                        onChange={handleMateriaChange}
                    >
                        <option value="">Seleccione una materia</option>
                        {materias.map((materia) => (
                            <option key={materia.id_materia} value={materia.id_materia}>
                                {materia.nombre}
                            </option>
                        ))}
                    </select>
                </div>

                {selectedMaterias.length > 0 && (
                    <div className="mt-3">
                        <h4>Materias Seleccionadas:</h4>
                        <ul>
                            {selectedMaterias.map((materia) => (
                                <li key={materia.id_materia}>{materia.nombre} - {materia.codigo}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="mb-3">
                    <label className="form-label">Subir Resolución:</label>
                    <input
                        type="file"
                        className="form-control"
                        name="resolucion"
                        onChange={handleFileChange}
                    />
                </div>
                
                <div className="mb-3">
                    <label className="form-label">Subir Dictamen:</label>
                    <input
                        type="file"
                        className="form-control"
                        name="dictamen"
                        onChange={handleFileChange}
                    />
                </div>

                <button type="submit" className="btn btn-primary">Generar PDF</button>
            </form>
        </div>
    );
};

export default PDFGenerator;
