// frontend/src/components/PDFGenerator.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const PDFGenerator = () => {
    const { id_convocatoria } = useParams();
    const [convocatorias, setConvocatorias] = useState([]);
    const [selectedConvocatoria, setSelectedConvocatoria] = useState(null);
    const [materias, setMaterias] = useState([]);
    const [selectedMaterias, setSelectedMaterias] = useState([]);
    const [additionalDocuments, setAdditionalDocuments] = useState([]);


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
                    setSelectedConvocatoria(response.data);
                } catch (error) {
                    console.error('Error al obtener la convocatoria:', error);
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
        const selectedMateria = materias.find(materia => materia.id_materia === parseInt(e.target.value));
        if (selectedMateria) {
            setSelectedMaterias(prevSelected => [...prevSelected, selectedMateria]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('id_convocatoria', selectedConvocatoria.id_convocatoria);
        formData.append('materias', JSON.stringify(selectedMaterias.map(materia => materia.id_materia)));

        // Agregar los documentos adicionales al FormData
        for (let i = 0; i < additionalDocuments.length; i++) {
            formData.append('documentos', additionalDocuments[i]);
        }

        try {
            const response = await axios.post('http://localhost:5000/pdf-generator', formData, {
                responseType: 'blob',
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'convocatoria.pdf');
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            console.error('Error al generar el PDF:', error);
        }
    };

    const handleDocumentUpload = (event) => {
        setAdditionalDocuments(event.target.files);
    };
    

    
    return (
        <div className="container">
            <h2>Generar PDF</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Convocatoria:</label>
                    <select onChange={handleConvocatoriaChange} value={selectedConvocatoria ? selectedConvocatoria.id_convocatoria : ''}>
                        <option value="">Seleccione una convocatoria</option>
                        {convocatorias.map(convocatoria => (
                            <option key={convocatoria.id_convocatoria} value={convocatoria.id_convocatoria}>
                                {convocatoria.cod_convocatoria} - {convocatoria.nombre}
                            </option>
                        ))}
                    </select>
                </div>

                {selectedConvocatoria && (
                    <div>
                        <label>Materias:</label>
                        <select onChange={handleMateriaChange}>
                            <option value="">Seleccione una materia</option>
                            {materias.map(materia => (
                                <option key={materia.id_materia} value={materia.id_materia}>
                                    {materia.nombre}
                                </option>
                            ))}
                        </select>

                        <ul>
                            {selectedMaterias.map(materia => (
                                <li key={materia.id_materia}>{materia.nombre}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <div>
                    <label>Documentos adicionales:</label>
                    <input
                        type="file"
                        multiple
                        onChange={handleDocumentUpload}
                    />
                </div>

                <button type="submit">Generar PDF</button>
            </form>
        </div>
    );
};

export default PDFGenerator;