// src/components/ConvocatoriaMateriasForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const ConvocatoriaMateriaForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [materias, setMaterias] = useState([]);
    const [selectedMateria, setSelectedMateria] = useState('');

    useEffect(() => {
        const fetchMaterias = async () => {
            try {
                const response = await axios.get('http://localhost:5000/materias');
                setMaterias(response.data);
            } catch (error) {
                console.error('Error al obtener las materias:', error);
            }
        };

        fetchMaterias();
    }, []);

    const handleChange = (e) => {
        setSelectedMateria(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/convocatorias/materias', {
                id_convocatoria: id,
                id_materia: selectedMateria
            });
            navigate(`/pdf-generator/${id}`); // Redirigir al generador de PDF con el ID de la convocatoria
        } catch (error) {
            console.error('Error al agregar materia a la convocatoria:', error);
        }
    };
    
    return (
        <form  className="container"onSubmit={handleSubmit}>
            <label>
                Materia:
                <select value={selectedMateria} onChange={handleChange}>
                    {materias.map(materia => (
                        <option key={materia.id_materia} value={materia.id_materia}>
                            {materia.nombre}
                        </option>
                    ))}
                </select>
            </label>
            <button type="submit">Agregar Materia</button>
        </form>
    );
};

export default ConvocatoriaMateriaForm;
