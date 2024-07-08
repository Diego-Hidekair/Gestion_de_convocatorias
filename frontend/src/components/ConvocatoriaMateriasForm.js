// src/components/ConvocatoriaMateriasForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ConvocatoriaMateriasForm = ({ idConvocatoria, refreshMaterias }) => {
    const [idMateria, setIdMateria] = useState('');
    const [materias, setMaterias] = useState([]);
    useEffect(() => {
        const fetchMaterias = async () => {
            try {
                const response = await axios.get('http://localhost:5000/materias');
                setMaterias(response.data);
            } catch (error) {
                console.error('Error fetching materias:', error);
            }
        };
        fetchMaterias();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/convocatoria-materia', {
                id_convocatoria: idConvocatoria,
                id_materia: idMateria
            });
            refreshMaterias(); // Actualizar la lista de materias después de agregar
            setIdMateria('');
        } catch (error) {
            console.error('Error adding materia:', error);
        }
    };

    return (
        <div className='container'>
            <h2>Agregar Materia a Convocatoria</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Seleccione la Materia:
                    <select value={idMateria} onChange={(e) => setIdMateria(e.target.value)}>
                        <option value=''>Seleccione una materia</option>
                        {materias.map(materia => (
                            <option key={materia.id_materia} value={materia.id_materia}>
                                {materia.nombre_materia}
                            </option>
                        ))}
                    </select>
                </label>
                <button type="submit">Agregar</button>
            </form>
        </div>
    );
};

export default ConvocatoriaMateriasForm;