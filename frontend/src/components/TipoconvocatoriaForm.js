// src/components/TipoconvocatoriaForm.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const TipoconvocatoriaForm = () => {
    const navigate = useNavigate();
    const [tipoConvocatoria, setTipoConvocatoria] = useState({ Nombre_convocatoria: '', Titulo: '' });
    

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
        if (tipoConvocatoria.Titulo.length > 200) {
            alert("El título no puede exceder los 200 caracteres.");
            return;
        }

        try {
            await axios.post('http://localhost:5000/tipos-convocatorias', tipoConvocatoria);

            navigate('/tipos-convocatorias');
        } catch (error) {
            console.error('Error al crear tipo de convocatoria:', error);
        }
    };

    
    return (
        <div className="container-tipo-conv mt-4-tipo-conv">
            <h1 className="mb-4-tipo-conv">Crear Nuevo Tipo de Convocatoria</h1>
            <form onSubmit={handleSubmit}>
                <div className="mb-3-tipo-conv">
                    <label className="form-label-tipo-conv">Nombre de Convocatoria:</label>
                    <input
                        type="text"
                        name="Nombre_convocatoria"
                        value={tipoConvocatoria.Nombre_convocatoria}
                        onChange={handleChange}
                        className="form-control-tipo-conv"
                        required
                    />
                </div>
                <div className="mb-3-tipo-conv">
                    <label className="form-label-tipo-conv">Título:</label>
                    <input
                        type="text"
                        name="Titulo"
                        value={tipoConvocatoria.Titulo}
                        onChange={handleChange}
                        className="form-control-tipo-conv"
                        maxLength="500"
                    />
                </div>
                <button type="submit" className="btn-tipo-conv btn-success-tipo-conv">Crear Tipo de Convocatoria</button>
            </form>
        </div>
    );
};

export default TipoconvocatoriaForm;
