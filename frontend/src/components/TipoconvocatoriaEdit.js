// src/components/TipoconvocatoriaEdit.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const TipoconvocatoriaEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tipoConvocatoria, setTipoConvocatoria] = useState({ Nombre_convocatoria: '' });

    useEffect(() => {
        const fetchTipoConvocatoria = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/tipo-convocatorias/${id}`);
                setTipoConvocatoria({
                    Nombre_convocatoria: response.data.Nombre_convocatoria || ''
                });
            } catch (error) {
                console.error('Error al obtener el tipo de convocatoria:', error);
            }
        };

        fetchTipoConvocatoria();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTipoConvocatoria(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!tipoConvocatoria.Nombre_convocatoria) {
            alert("Por favor, complete el campo del nombre de convocatoria.");
            return;
        }

        try {
            await axios.put(`http://localhost:5000/tipo-convocatorias/${id}`, {
                Nombre_convocatoria: tipoConvocatoria.Nombre_convocatoria
            });
            navigate('/tipoconvocatorias');
        } catch (error) {
            console.error('Error al actualizar el tipo de convocatoria:', error);
            alert("Hubo un error al actualizar la convocatoria. Intenta nuevamente.");
        }
    };

    return (
        <div className="container mt-4">
            <h1 className="mb-4">Editar Tipo de Convocatoria</h1>
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
                <button type="submit" className="btn btn-primary">Guardar Cambios</button>
            </form>
        </div>
    );
};

export default TipoconvocatoriaEdit;
