// frontend/src/components/ConvocatoriaMateriasForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const ConvocatoriaMateriasForm = () => {
    const { id_convocatoria } = useParams();
    const navigate = useNavigate();
    const [materias, setMaterias] = useState([]);
    const [selectedMateria, setSelectedMateria] = useState('');

    useEffect(() => {
        const fetchMaterias = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/materias');
                setMaterias(response.data);
            } catch (error) {
                console.error('Error al obtener las materias:', error);
            }
        };

        fetchMaterias();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/convocatoria-materias', {
                id_convocatoria,
                id_materia: selectedMateria,
            });
            navigate(`/convocatorias/${id_convocatoria}/materias`);
        } catch (error) {
            console.error('Error al crear la relación convocatoria-materia:', error);
        }
    };

    return (
        <div className="container">
            <h2>Agregar Materia a Convocatoria</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Materia:
                    <select
                        value={selectedMateria}
                        onChange={(e) => setSelectedMateria(e.target.value)}
                        required
                    >
                        <option value="">Seleccione una materia</option>
                        {materias.map((materia) => (
                            <option key={materia.id_materia} value={materia.id_materia}>
                                {materia.nombre}
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
