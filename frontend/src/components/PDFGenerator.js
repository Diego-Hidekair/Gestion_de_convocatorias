// frontend/src/components/PDFGenerator.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PDFGenerator = () => {
    const [convocatorias, setConvocatorias] = useState([]);
    const [materias, setMaterias] = useState([]);
    const [formData, setFormData] = useState({
        nombre: '',
        fechaInicio: '',
        fechaFin: '',
        tipoConvocatoria: '',
        carrera: '',
        facultad: '',
        materiasSeleccionadas: [],  // Nuevo campo para las materias seleccionadas
        creadoPor: 'Admin',
        fechaCreacion: new Date().toISOString().split('T')[0]
    });
    
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

    const handleConvocatoriaChange = (e) => {
        const selectedId = e.target.value;
        const convocatoria = convocatorias.find(conv => conv.id_convocatoria === parseInt(selectedId));
        if (convocatoria) {
            setFormData({
                ...formData,
                nombre: convocatoria.nombre,
                fechaInicio: convocatoria.fecha_inicio.split('T')[0],
                fechaFin: convocatoria.fecha_fin.split('T')[0],
                tipoConvocatoria: convocatoria.tipo_convocatoria,
                carrera: convocatoria.carrera,
                facultad: convocatoria.facultad
            });
        }
    };
    
    const handleMateriaChange = (e, index) => {
        const selectedMateria = e.target.value;
        const updatedMaterias = [...formData.materiasSeleccionadas];
        updatedMaterias[index] = selectedMateria;
        setFormData({
            ...formData,
            materiasSeleccionadas: updatedMaterias
        });
    };

    const handleAddMateria = () => {
        setFormData({
            ...formData,
            materiasSeleccionadas: [...formData.materiasSeleccionadas, '']
        });
    };

    const handleRemoveMateria = (index) => {
        const updatedMaterias = [...formData.materiasSeleccionadas];
        updatedMaterias.splice(index, 1);
        setFormData({
            ...formData,
            materiasSeleccionadas: updatedMaterias
        });
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/pdf/create', formData, {
                responseType: 'blob'  // Importante para manejar archivos binarios
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
            <label>
                Nombre:
                <input type="text" name="nombre" value={formData.nombre} readOnly />
            </label>
            <label>
                Fecha de Inicio:
                <input type="date" name="fechaInicio" value={formData.fechaInicio} readOnly />
            </label>
            <label>
                Fecha de Fin:
                <input type="date" name="fechaFin" value={formData.fechaFin} readOnly />
            </label>
            <label>
                Tipo de Convocatoria:
                <input type="text" name="tipoConvocatoria" value={formData.tipoConvocatoria} readOnly />
            </label>
            <label>
                Carrera:
                <input type="text" name="carrera" value={formData.carrera} readOnly />
            </label>
            <label>
                Facultad:
                <input type="text" name="facultad" value={formData.facultad} readOnly />
            </label>
            {formData.materiasSeleccionadas.map((materia, index) => (
                <div key={index}>
                    <label>
                        Materia {index + 1}:
                        <select
                            name={`materia${index}`}
                            value={materia}
                            onChange={(e) => handleMateriaChange(e, index)}
                            required
                        >
                            <option value="">Selecciona una materia</option>
                            {materias.map(mat => (
                                <option key={mat.id_materia} value={mat.nombre}>
                                    {mat.nombre}
                                </option>
                            ))}
                        </select>
                    </label>
                    {index > 0 && (
                        <button type="button" onClick={() => handleRemoveMateria(index)}>
                            Eliminar Materia
                        </button>
                    )}
                </div>
            ))}
            <button type="button" onClick={handleAddMateria}>
                Agregar Materia
            </button>
            <button type="submit">Generar PDF</button>
        </form>
    );
};

export default PDFGenerator;