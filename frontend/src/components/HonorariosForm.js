// frontend/src/components/HonorariosForm.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';  // Importar useNavigate

const HonorariosForm = () => {
    const { id_convocatoria } = useParams();
    const [idTipoConvocatoria, setIdTipoConvocatoria] = useState('');
    const [pagoMensual, setPagoMensual] = useState('');
    const [tiposConvocatorias, setTiposConvocatorias] = useState([]);
    const [error, setError] = useState(null);
    const [convocatorias, setConvocatorias] = useState([]);
    const [idConvocatoria, setIdConvocatoria] = useState('');
    const navigate = useNavigate();  // Usar useNavigate

    // Obtener tipos de convocatorias
    useEffect(() => {
        const fetchTiposConvocatorias = async () => {
            try {
                const response = await axios.get('http://localhost:5000/tipo-convocatorias');
                setTiposConvocatorias(response.data);
            } catch (err) {
                setError('Error al obtener los tipos de convocatorias');
                console.error('Error al obtener los tipos de convocatorias:', err.response ? err.response.data : err);
            }
        };

        fetchTiposConvocatorias();
    }, []);

    // Obtener convocatorias
    useEffect(() => {
        const fetchConvocatorias = async () => {
            try {
                const response = await axios.get('http://localhost:5000/convocatorias');
                setConvocatorias(response.data);
            } catch (err) {
                setError('Error al obtener las convocatorias');
                console.error('Error al obtener las convocatorias:', err.response ? err.response.data : err);
            }
        };

        fetchConvocatorias();
    }, []);

      const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (!idTipoConvocatoria || !pagoMensual) {
            setError('Por favor, complete todos los campos');
            return;
        }
    
        try {
          await axios.post('http://localhost:5000/honorarios', {
              id_convocatoria: id_convocatoria,  // Usa el id de la URL
              id_tipoconvocatoria: idTipoConvocatoria,
              pago_mensual: pagoMensual,
          });
    
            alert('Honorario creado exitosamente');
            navigate(`/honorarios/new/${id_convocatoria}`);  // Redirigir usando navigate
        } catch (err) {
            setError('Error al crear el honorario');
            console.error(err);
        }
    };
  

    return (
        <div className="container mt-4">
            <h2>Crear Honorario</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">Seleccionar Convocatoria:</label>
                    <select
                        className="form-control"
                        value={idConvocatoria || id_convocatoria}
                        onChange={(e) => setIdConvocatoria(e.target.value)}
                        disabled={!!id_convocatoria}  // Deshabilitar si se pasa el id desde la URL
                    >
                        <option value="">Seleccione una convocatoria</option>
                        {convocatorias.map((convocatoria) => (
                            <option key={convocatoria.id_convocatoria} value={convocatoria.id_convocatoria}>
                                {convocatoria.nombre}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-3">
                    <label className="form-label">Seleccionar Tipo de Convocatoria:</label>
                    <select
                        className="form-control"
                        value={idTipoConvocatoria}
                        onChange={(e) => setIdTipoConvocatoria(e.target.value)}
                    >
                        <option value="">Seleccione un tipo de convocatoria</option>
                        {tiposConvocatorias.map((tipo) => (
                            <option key={tipo.id_tipoconvocatoria} value={tipo.id_tipoconvocatoria}>
                                {tipo.nombre_convocatoria}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-3">
                    <label className="form-label">Pago Mensual:</label>
                    <input
                        type="text"
                        className="form-control"
                        value={pagoMensual}
                        onChange={(e) => setPagoMensual(e.target.value)}
                        placeholder="Ingrese el pago mensual"
                    />
                </div>

                <button type="submit" className="btn btn-primary">
                    Guardar Honorario
                </button>
            </form>
        </div>
    );
};

export default HonorariosForm;
