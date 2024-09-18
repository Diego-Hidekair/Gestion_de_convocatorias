// frontend/src/components/ConvocatoriaMateriasForm.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const ConvocatoriaMateriasForm = () => { 
    const { id_convocatoria } = useParams();
    const navigate = useNavigate();
    const [materias, setMaterias] = useState([]);
    const [materiasSeleccionadas, setMateriasSeleccionadas] = useState([]);
    const [perfilProfesional, setPerfilProfesional] = useState('');
    const [totalHoras, setTotalHoras] = useState(''); // Nueva variable para total_horas
    const [materiaSeleccionada, setMateriaSeleccionada] = useState('');
    const [error, setError] = useState(null);

    // Obtener las materias desde el backend
    useEffect(() => {
        const fetchMaterias = async () => {
            try {
                const response = await axios.get('http://localhost:5000/materias');
                setMaterias(response.data);
            } catch (err) {
                setError('Error al obtener las materias');
                console.error(err);
            }
        };
        fetchMaterias();
    }, []);

   // enviar los datos seleccionados
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (materiasSeleccionadas.length === 0 || !perfilProfesional || !totalHoras) {
            setError('Por favor, complete todos los campos');
            return;
        }

        try {
            const results = await Promise.all(materiasSeleccionadas.map(async (materia) => {
                const response = await axios.post('http://localhost:5000/convocatoria-materias', {
                    id_convocatoria: id_convocatoria,
                    id_materia: materia.id_materia,
                    perfil_profesional: perfilProfesional,
                    total_horas: totalHoras, // Enviar total_horas
                });
                return response.data;  // Suponiendo que el backend devuelve el id de convocatoria_materia
            }));

            const idConvocatoriaMateria = results[0].id;  // Tomando el primer id de convocatoria_materia (puedes ajustar esto si es necesario)
 
            alert('Materias agregadas exitosamente');
            // Redirigir a la página de honorarios usando el id de convocatoria_materia
            navigate(`/honorarios/new/${id_convocatoria}/${idConvocatoriaMateria}`);
        } catch (err) {
            setError('Error al crear la ConvocatoriaMateria');
            console.error(err);
        }
    };

    // Agregar una materia seleccionada a la lista
    const handleAddMateria = () => {
        const materia = materias.find(m => m.id_materia === parseInt(materiaSeleccionada));
        if (materia && !materiasSeleccionadas.some(m => m.id_materia === materia.id_materia)) {
            setMateriasSeleccionadas([...materiasSeleccionadas, materia]);
            setMateriaSeleccionada('');
        }
    };

    const handleRemoveMateria = (id) => {
        setMateriasSeleccionadas(materiasSeleccionadas.filter(materia => materia.id_materia !== id));
    };

    return (
        <div className="container mt-4">
            <h2>Agregar materias a la Convocatoria</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <form onSubmit={handleSubmit}>
                {/* Seleccionar materia */}
                <div className="mb-3">
                    <label className="form-label">Seleccionar Materia:</label>
                    <select
                        className="form-control"
                        value={materiaSeleccionada}
                        onChange={(e) => setMateriaSeleccionada(e.target.value)}
                    >
                        <option value="">Seleccione una materia</option>
                        {materias.map((materia) => (
                            <option key={materia.id_materia} value={materia.id_materia}>
                                {materia.nombre}
                            </option>
                        ))}
                    </select>
                    <button
                        type="button"
                        className="btn btn-secondary mt-2"
                        onClick={handleAddMateria}
                    >
                        Agregar Materia
                    </button>
                </div>

                {/* Mostrar materias seleccionadas */}
                <div className="mb-3">
                    <h3>Materias Seleccionadas:</h3>
                    <ul className="list-group">
                        {materiasSeleccionadas.map((materia) => (
                            <li key={materia.id_materia} className="list-group-item">
                                {materia.nombre}
                                <button
                                    type="button"
                                    className="btn btn-danger btn-sm float-end"
                                    onClick={() => handleRemoveMateria(materia.id_materia)}
                                >
                                    Eliminar
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Perfil Profesional */}
                <div className="mb-3">
                    <label className="form-label">Perfil Profesional:</label>
                    <input
                        type="text"
                        className="form-control"
                        value={perfilProfesional}
                        onChange={(e) => setPerfilProfesional(e.target.value)}
                        placeholder="Ingrese el perfil profesional"
                        required
                    />
                </div>

                {/* Total Horas */}
                <div className="mb-3">
                    <label className="form-label">Total Horas:</label>
                    <input
                        type="number"
                        className="form-control"
                        value={totalHoras}
                        onChange={(e) => setTotalHoras(e.target.value)}
                        placeholder="Ingrese el total de horas"
                        required
                    />
                </div>

                <button type="submit" className="btn btn-primary">
                    Siguiente
                </button>
            </form>
        </div>
    );
};

export default ConvocatoriaMateriasForm;
