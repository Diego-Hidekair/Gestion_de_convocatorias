// frontend/src/components/PDFGenerator.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PDFGenerator = () => {
    const [convocatorias, setConvocatorias] = useState([]);
    const [formData, setFormData] = useState({
        nombre: '',
        fechaInicio: '',
        fechaFin: '',
        tipoConvocatoria: '',
        carrera: '',
        facultad: '',
        materias: [],
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
        fetchConvocatorias();
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
                facultad: convocatoria.facultad,
                materias: convocatoria.materias || []  // Asumiendo que materias es una lista de strings
            });
        }
    };
    
    /*const handleMateriasChange = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
        setSelectedMaterias(selectedOptions);
    };*/

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
            <label>
                Materias:
                <textarea name="materias" value={formData.materias.join(', ')} readOnly />
            </label>
            <button type="submit">Generar PDF</button>
        </form>
    );
};

export default PDFGenerator;