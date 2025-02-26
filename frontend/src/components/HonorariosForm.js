import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import '../styles/honorarios.css';

const HonorariosForm = () => {
    const location = useLocation();
    const id_materia = location.state?.id_materia || null;
    const { id_convocatoria, id_honorario } = useParams();
    const navigate = useNavigate();
    const [pagoMensual, setPagoMensual] = useState('');
    const [resolucion, setResolucion] = useState('');
    const [dictamen, setDictamen] = useState('');
    const [nombreConvocatoria, setNombreConvocatoria] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false); // Agregado
    const token = localStorage.getItem('token'); // Agregado

    useEffect(() => {
        if (id_honorario) {
            const fetchHonorario = async () => {
                try {
                    const response = await axios.get(`http://localhost:5000/honorarios/${id_honorario}`);
                    const honorario = response.data;
                    setPagoMensual(honorario.pago_mensual);
                    setResolucion(honorario.resolucion);
                    setDictamen(honorario.dictamen);
                } catch (err) {
                    setError('Error al obtener el honorario.');
                }
            };
            fetchHonorario();
        }
    }, [id_honorario]);

    useEffect(() => {
        localStorage.setItem('currentPage', `/honorarios/new/${id_convocatoria}/${id_materia}`);

        const fetchNombreConvocatoria = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/convocatorias/${id_convocatoria}`);
                setNombreConvocatoria(response.data.nombre_tipoconvocatoria);
            } catch (err) {
                setError('Error al obtener el tipo de convocatoria.');
            }
        };

        fetchNombreConvocatoria();
    }, [id_convocatoria, id_materia]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!id_convocatoria) {
            setError('No se ha seleccionado una convocatoria.');
            return;
        }

        try {
            if (id_honorario) {
                // Modo edición
                await axios.put(`http://localhost:5000/honorarios/${id_honorario}`, {
                    pago_mensual: pagoMensual,
                    resolucion,
                    dictamen
                });
                alert('Honorario actualizado correctamente.');
            } else {
                // Modo creación
                const response = await axios.post('http://localhost:5000/honorarios', {
                    id_convocatoria,
                    pago_mensual: pagoMensual,
                    resolucion,
                    dictamen
                });
                const { id_honorario: newIdHonorario } = response.data;
                navigate(`/pdf/generar/${id_convocatoria}/${newIdHonorario}`);
            }
        } catch (error) {
            console.error('Error creando/actualizando honorario:', error);
            setError('Error creando/actualizando el honorario');
        }
    };

    const handleBack = () => {
        if (id_materia) {
            navigate(`/convocatorias_materias/edit/${id_materia}/${id_convocatoria}`);
        } else if (id_convocatoria) {
            navigate(`/convocatorias_materias/edit/${id_convocatoria}`);
        }
    };

    const handleCancel = () => {
        localStorage.removeItem('honorariosState');
        localStorage.removeItem('currentPage');
        setPagoMensual('');
        setResolucion('');
        setDictamen('');
        navigate('/');
    };

    return (
        <div className="container-honorarios mt-4-honorarios">
            <h2 className="titulo-honorario">{id_honorario ? 'Editar' : 'Crear'} Honorario</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <form onSubmit={handleSubmit}>
                <div className="mb-3-honorarios" style={{ textAlign: 'center' }}>
                    <label className="form-label-honorarios">Tipo de Convocatoria:</label>
                    <h3 style={{ margin: '10px 0', color: '#333' }}>{nombreConvocatoria}</h3>
                </div>

                <div className="mb-3-honorarios">
                    <label className="form-label-honorarios">Pago Mensual:</label>
                    <input
                        type="number"
                        className="form-control-honorarios"
                        value={pagoMensual}
                        onChange={(e) => setPagoMensual(e.target.value)}
                        placeholder="Ingrese el pago mensual"
                        required
                    />
                </div>
                <br />
                <div className="mb-3-honorarios">
                    <label className="form-label-honorarios">Resolución:</label>
                    <input
                        type="text"
                        className="form-control-honorarios"
                        value={resolucion}
                        onChange={(e) => setResolucion(e.target.value)}
                        placeholder="Ingrese el número de resolución"
                    />
                </div>
                <br />
                <div className="mb-3-honorarios">
                    <label className="form-label-honorarios">Dictamen:</label>
                    <input
                        type="text"
                        className="form-control-honorarios"
                        value={dictamen}
                        onChange={(e) => setDictamen(e.target.value)}
                        placeholder="Ingrese el número de dictamen"
                    />
                </div>
                <br />
                <button type="button" className="btn-honorarios btn-secondary-honorarios ml-2-honorarios" onClick={handleBack}>Volver</button>
                <button type="submit" className="btn-honorarios btn-primary-honorarios">{id_honorario ? 'Actualizar' : 'Siguiente'}</button>
                <button type="button" className="btn-honorarios btn-danger-honorarios ml-2-honorarios" onClick={handleCancel}>Cancelar</button>
            </form>
        </div>
    );
};

export default HonorariosForm;