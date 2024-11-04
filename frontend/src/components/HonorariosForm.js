// frontend/src/components/HonorariosForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import '../styles/honorarios.css';

const HonorariosForm = () => {
    const location = useLocation();
    const id_materia = location.state?.id_materia || null;
    const { id_convocatoria } = useParams();
    const navigate = useNavigate();
    const [pagoMensual, setPagoMensual] = useState('');
    const [idTipoConvocatoria, setIdTipoConvocatoria] = useState('');
    const [resolucion, setResolucion] = useState('');
    const [dictamen, setDictamen] = useState('');
    const [tiposConvocatorias, setTiposConvocatorias] = useState([]);
    const [error, setError] = useState(null);

    // Obtener tipos de convocatorias
    useEffect(() => {
        const fetchTiposConvocatorias = async () => {
            try {
                const response = await axios.get('http://localhost:5000/tipos-convocatorias');
                setTiposConvocatorias(response.data);
            } catch (err) {
                setError('Error al obtener los tipos de convocatorias. Por favor, inténtalo más tarde.');
            }
        };
        fetchTiposConvocatorias();
    }, []);

    // Enviar los datos seleccionados 
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!id_convocatoria) {
            setError('No se ha seleccionado una convocatoria.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/honorarios', {
                id_convocatoria,
                id_tipoconvocatoria: idTipoConvocatoria,
                pago_mensual: pagoMensual,
                resolucion: resolucion,
                dictamen: dictamen
            });
    
            const { id_honorario } = response.data;
            navigate(`/pdf/generar/${id_convocatoria}/${id_honorario}`);
        } catch (error) {
            console.error('Error creando honorario:', error);
            setError('Error creando el honorario');
        }
    };    

    const handleBack = () => {
        if (id_materia) {
            navigate(`/convocatorias_materias/edit/${id_materia}/${id_convocatoria}`);
        } else if (id_convocatoria) {
            navigate(`/convocatorias_materias/edit/${id_convocatoria}`);
        }
    };

    return (
        <div className="container-honorarios mt-4-honorarios">
            <h2 className="titulo-honorario">Crear Honorario</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <form onSubmit={handleSubmit}>
                <div className="mb-3-honorarios">
                    <label className="form-label-honorarios">Seleccionar Tipo de Convocatoria:</label>
                    <select
                        className="form-control-honorarios"
                        value={idTipoConvocatoria}
                        onChange={(e) => setIdTipoConvocatoria(e.target.value)}
                        required
                    >
                        <option value="">Seleccione un tipo de convocatoria</option>
                        {tiposConvocatorias.map((tipo) => (
                            <option key={tipo.id_tipoconvocatoria} value={tipo.id_tipoconvocatoria}>
                                {tipo.nombre_convocatoria}
                            </option>
                        ))}
                    </select>
                </div>
                <br></br>
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
                <br></br>
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
                <br></br>
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
                <br></br>
                <button type="button" className="btn-honorarios btn-secondary-honorarios ml-2-honorarios" onClick={handleBack}>Volver</button>
                <button type="submit" className="btn-honorarios btn-primary-honorarios">Siguiente</button>
                
            </form>
        </div>
    );
};

export default HonorariosForm;
