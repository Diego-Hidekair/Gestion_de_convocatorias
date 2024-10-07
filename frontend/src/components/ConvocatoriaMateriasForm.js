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
    const [materiaSeleccionada, setMateriaSeleccionada] = useState('');
    const [error, setError] = useState(null);
    const [totalHoras, setTotalHoras] = useState(0);

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
    
    useEffect(() => {
        // Calcular total de horas al modificar la lista de materias seleccionadas
        const total = materiasSeleccionadas.reduce((acc, materia) => acc + materia.total_horas, 0);
        setTotalHoras(total);
    }, [materiasSeleccionadas]);

    // Enviar los datos seleccionados
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (materiasSeleccionadas.length === 0 || !perfilProfesional) {
            setError('Por favor, complete todos los campos');
            return;
        }
    
        const tiempoTrabajo = totalHoras >= 24 ? 'TIEMPO COMPLETO' : 'TIEMPO HORARIO';
    
        try {
            const response = await axios.post(`http://localhost:5000/convocatoria-materias/multiple`, {
                id_convocatoria,
                materiasSeleccionadas: materiasSeleccionadas.map(m => m.id_materia),
                perfil_profesional: perfilProfesional,
                tiempo_trabajo: tiempoTrabajo  // Añadimos el campo para ser enviado
            });
    
            alert(`Materias agregadas exitosamente. Total de horas: ${totalHoras}`);
    
            const firstIdMateria = response.data.idsMaterias ? response.data.idsMaterias[0] : null;
            if (firstIdMateria) {
                navigate(`/honorarios/new/${id_convocatoria}/${firstIdMateria}`);
            } else {
                setError('No se pudo obtener el ID de la materia');
            }
    
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
        } else {
            setError('Materia ya seleccionada o no válida');
        }
    };

    // Eliminar una materia seleccionada
    const handleRemoveMateria = (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar esta materia?')) {
            setMateriasSeleccionadas(materiasSeleccionadas.filter(m => m.id_materia !== id));
        }
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
                    <button type="button" className="btn btn-secondary mt-2" onClick={handleAddMateria}>
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
                                <button type="button" className="btn btn-danger btn-sm float-end" onClick={() => handleRemoveMateria(materia.id_materia)}>
                                    Eliminar
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="mb-3">
    <h4>Tiempo de Trabajo: {totalHoras >= 24 ? 'TIEMPO COMPLETO' : 'TIEMPO HORARIO'}</h4>
</div>

                {/* Perfil Profesional */}
                <div className="mb-3">
                    <label className="form-label">Perfil Profesional:</label>
                    <input
                        type="text"
                        className="form-control"
                        value={perfilProfesional}
                        onChange={(e) => setPerfilProfesional(e.target.value)}
                        placeholder="Ingrese el perfil profesional como ser Ingeniero Comercial"
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary">
                    Guardar
                </button>
            </form>
        </div>
    );
};

export default ConvocatoriaMateriasForm;
