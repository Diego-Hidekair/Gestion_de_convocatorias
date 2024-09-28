// src/components/TipoconvocatoriaForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const TipoconvocatoriaForm = () => {
    const navigate = useNavigate();
    const [tipoConvocatoria, setTipoConvocatoria] = useState({ Nombre_convocatoria: '' });

    useEffect(() => {
        // No se requieren datos adicionales en el formulario
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTipoConvocatoria({ ...tipoConvocatoria, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!tipoConvocatoria.Nombre_convocatoria) {
            alert("Por favor, complete el campo del nombre de convocatoria.");
            return;
        }

        try {
            await axios.post('http://localhost:5000/tipo-convocatorias', {
                Nombre_convocatoria: tipoConvocatoria.Nombre_convocatoria
            });
            navigate('/tipoconvocatorias');
        } catch (error) {
            console.error('Error al crear tipo de convocatoria:', error);
        }
    };

    return (
        <div className="container mt-4">
            <h1 className="mb-4">Crear Nuevo Tipo de Convocatoria</h1>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">Nombre de Convocatoria:</label>
                    <input
                        type="text"
                        name="Nombre_convocatoria"
                        value={tipoConvocatoria.Nombre_convocatoria}
                        onChange={handleChange}
                        className="form-control"
                        required
                    />
                </div>
                <button type="submit" className="btn btn-success">Crear Tipo de Convocatoria</button>
            </form>
        </div>
    );
};

export default TipoconvocatoriaForm;
