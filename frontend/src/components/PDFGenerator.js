// frontend/src/components/PDFGenerator.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PDFGenerator = () => {
    const [convocatorias, setConvocatorias] = useState([]);
    const [selectedConvocatoria, setSelectedConvocatoria] = useState(null);
    const [materias, setMaterias] = useState([]);
    const [selectedMaterias, setSelectedMaterias] = useState([]);

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
        try {
            const response = await axios.post('http://localhost:5000/pdf/create', {
                id_convocatoria: selectedConvocatoria.id_convocatoria,
                materias: selectedMaterias.map(materia => materia.id_materia),
            }, {
                responseType: 'blob'  // Importante para manejar archivos binarios
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${selectedConvocatoria.nombre}.pdf`);
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            console.error('Error al generar el PDF:', error);
        }
    };

    return (
        <form className="container" onSubmit={handleSubmit}>
            <label>
                Selecciona una Convocatoria:
                <select onChange={handleConvocatoriaChange} required>
                    <option value="">Selecciona una convocatoria</option>
                    {convocatorias.map(conv => (
                        <option key={conv.id_convocatoria} value={conv.id_convocatoria}>
                            {conv.nombre}
                        </option>
                    ))}
                </select>
            </label>
            {selectedConvocatoria && (
                <div>
                <label>
                    Código de Convocatoria:
                    <input type="text" value={selectedConvocatoria.cod_convocatoria} readOnly />
                </label>
                <label>
                    Nombre:
                    <input type="text" value={selectedConvocatoria.nombre} readOnly />
                </label>
                <label>
                    Fecha de Inicio:
                    <input type="date" value={selectedConvocatoria.fecha_inicio.split('T')[0]} readOnly />
                </label>
                <label>
                    Fecha de Fin:
                    <input type="date" value={selectedConvocatoria.fecha_fin.split('T')[0]} readOnly />
                </label>
                <label>
                    Tipo de Convocatoria:
                    <input type="text" value={selectedConvocatoria.tipo_convocatoria} readOnly />
                </label>
                <label>
                    Carrera:
                    <input type="text" value={selectedConvocatoria.carrera} readOnly />
                </label>
                <label>
                    Facultad:
                    <input type="text" value={selectedConvocatoria.facultad} readOnly />
                </label>
            </div>
        )}
        <label>
            Selecciona una Materia:
            <select onChange={handleMateriaChange}>
                <option value="">Selecciona una materia</option>
                {materias.map(materia => (
                    <option key={materia.id_materia} value={materia.id_materia}>
                        {materia.nombre}
                    </option>
                ))}
            </select>
        </label>
        <ul>
            {selectedMaterias.map(materia => (
                <li key={materia.id_materia}>{materia.nombre}</li>
            ))}
        </ul>
        <button type="submit">Generar PDF</button>
    </form>
);
};

export default PDFGenerator;
