// frontend/src/components/ConvocatoriaMateriasForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
import { useNavigate, useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/convocatoriaMaterias.css';

const ConvocatoriaMateriasForm = () => { 
    const { id_convocatoria } = useParams();
    const navigate = useNavigate();
    const [materias, setMaterias] = useState([]);
    const [materiasSeleccionadas, setMateriasSeleccionadas] = useState([]);
    const [perfilProfesional, setPerfilProfesional] = useState('');
    const [materiaSeleccionada, setMateriaSeleccionada] = useState('');
    const [error, setError] = useState(null);
    const [totalHoras, setTotalHoras] = useState(0);

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
    
    useEffect(() => {//total de horas de las materias seleccionadas
        const total = materiasSeleccionadas.reduce((acc, materia) => acc + materia.total_horas, 0);
        setTotalHoras(total);
    }, [materiasSeleccionadas]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (materiasSeleccionadas.length === 0 || !perfilProfesional) {
            setError('Por favor, complete todos los campos');
            return;
        }
    
        const tiempoTrabajo = totalHoras >= 24 ? 'TIEMPO COMPLETO' : 'TIEMPO HORARIO';

        try {
            const response = await axios.post('http://localhost:5000/convocatoria-materias/multiple', {
                id_convocatoria,
                materiasSeleccionadas: materiasSeleccionadas.map(m => m.id_materia),
                perfil_profesional: perfilProfesional,
                tiempo_trabajo: tiempoTrabajo 
            });
    
            alert(`Materias agregadas exitosamente. Total de horas: ${totalHoras}`);
            const firstIdMateria = response.data.idsMaterias ? response.data.idsMaterias[0] : null;
            if (firstIdMateria) {
                navigate(`/honorarios/new/${id_convocatoria}/${firstIdMateria}`);
            } else {
                setError('No se pudo obtener el ID de la materia');
            }
        } catch (err) {
            setError('Error al agregar materias');
            console.error(err);
        }
    };

    const handleAddMateria = () => {//se seleciona la amteria y se agrega a la lista
        const materia = materias.find(m => m.id_materia === parseInt(materiaSeleccionada));
        if (materia && !materiasSeleccionadas.some(m => m.id_materia === materia.id_materia)) {
            setMateriasSeleccionadas([...materiasSeleccionadas, materia]);
            setMateriaSeleccionada('');
        } else {
            setError('Materia ya seleccionada o no válida');
        }
    };

    const handleRemoveMateria = (id_materia) => {//eliminar la materia de la lista seleccionada
        if (window.confirm('¿Estás seguro de que deseas eliminar esta materia?')) {
            setMateriasSeleccionadas(materiasSeleccionadas.filter(m => m.id_materia !== id_materia));
        }
    };

    return (
        <div className="container-conv-mat mt-4-conv-mat">
            <h2 className="titutlo-conv-mat">Agregar materias a la Convocatoria</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div className="mb-3-conv-mat">
                    <label className="form-label-conv-mat">Seleccionar Materia:</label>
                    <select
                        className="form-control-conv-mat"
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
                    <button type="button" className="btn-conv-mat btn-secondary-conv-mat mt-2-conv-mat" onClick={handleAddMateria}>
                        Agregar Materia
                    </button>
                </div>
                <div className="mb-3-conv-mat">
                    <h3>Materias Seleccionadas:</h3>
                    <ul className="list-group-conv-mat">
                        {materiasSeleccionadas.map((materia) => (
                            <li key={materia.id_materia} className="list-group-item-conv-mat">
                                {materia.nombre}
                                <button type="button-conv-mat" className="btn-conv-mat btn-danger-conv-mat btn-sm-conv-mat float-end-conv-mat" onClick={() => handleRemoveMateria(materia.id_materia)}>
                                    Eliminar
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="mb-3-conv-mat">
                    <h4>Tiempo de Trabajo: {totalHoras >= 24 ? 'TIEMPO COMPLETO' : 'TIEMPO HORARIO'}</h4>
                </div>
                <div className="mb-3-conv-mat">
                    <label className="form-label-conv-mat">Perfil Profesional:</label>
                    <input
                        type="text"
                        className="form-control-conv-mat"
                        value={perfilProfesional}
                        onChange={(e) => setPerfilProfesional(e.target.value)}
                        placeholder="Ingrese el perfil profesional como ser Ingeniero Comercial"
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary-conv-mat">
                    Siguiente
                </button>
            </form>
        </div>
    );
};

export default ConvocatoriaMateriasForm;