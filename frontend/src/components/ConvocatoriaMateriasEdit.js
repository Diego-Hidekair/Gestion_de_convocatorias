    // frontend/src/components/ConvocatoriaMateriasEdit.js

    import React, { useEffect, useState } from 'react';
    import axios from 'axios';
    import { useParams, useNavigate  } from 'react-router-dom';

    const ConvocatoriaMateriasEdit = () => {
        const { id_convocatoria, id_materia } = useParams();
        const navigate = useNavigate();
        const [materia, setMateria] = useState(null);
        const [perfilProfesional, setPerfilProfesional] = useState('');
        const [totalHoras, setTotalHoras] = useState('');
        const [error, setError] = useState(null);

        useEffect(() => {
            const fetchMateria = async () => {
                try {
                    const response = await axios.get(`http://localhost:5000/convocatoria-materias/${id_convocatoria}/${id_materia}`);
                    setMateria(response.data);
                    setPerfilProfesional(response.data.perfil_profesional);
                    setTotalHoras(response.data.total_horas);
                } catch (err) {
                    setError('Error al obtener los datos de la materia');
                    console.error(err);
                }
            };
            fetchMateria();
        }, [id_convocatoria, id_materia]);

        const handleSubmit = async (e) => {
            e.preventDefault();
            try {
                await axios.put(`http://localhost:5000/convocatoria-materias/${id_convocatoria}/${id_materia}`, {
                    perfil_profesional: perfilProfesional,
                    total_horas: totalHoras,
                });
                alert('Materia editada exitosamente');
                navigate(`/convocatorias/${id_convocatoria}/materias`);
            } catch (err) {
                setError('Error al editar la materia');
                console.error(err);
            }
        };

        if (!materia) return <p>Cargando datos...</p>;

        return (
            <div className="container mt-4">
                <h2>Editar Materia de la Convocatoria</h2>
                {error && <p style={{ color: 'red' }}>{error}</p>}

                <form onSubmit={handleSubmit}>
                    {/* Perfil Profesional */}
                    <div className="mb-3">
                        <label className="form-label">Perfil Profesional:</label>
                        <input
                            type="text"
                            className="form-control"
                            value={perfilProfesional}
                            onChange={(e) => setPerfilProfesional(e.target.value)}
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
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary">Guardar Cambios</button>
                </form>
            </div>
        );
    };

    export default ConvocatoriaMateriasEdit;
