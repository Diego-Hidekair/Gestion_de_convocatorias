// frontend/src/components/ConvocatoriaForm.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ConvocatoriaForm = () => {
    const navigate = useNavigate();
    const [convocatoria, setConvocatoria] = useState({
        cod_convocatoria: '',
        nombre: '',
        fecha_inicio: '',
        fecha_fin: '',
        id_tipoconvocatoria: '',
        id_carrera: '',
        id_facultad: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setConvocatoria({ ...convocatoria, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/convocatorias', convocatoria);
            navigate(`/convocatorias/${response.data.id_convocatoria}/materias`);
        } catch (error) {
            console.error('Error al crear convocatoria:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <label>
                Código Convocatoria:
                <input type="text" name="cod_convocatoria" value={convocatoria.cod_convocatoria} onChange={handleChange} />
            </label>
            <label>
                Nombre:
                <input type="text" name="nombre" value={convocatoria.nombre} onChange={handleChange} />
            </label>
            <label>
                Fecha Inicio:
                <input type="date" name="fecha_inicio" value={convocatoria.fecha_inicio} onChange={handleChange} />
            </label>
            <label>
                Fecha Fin:
                <input type="date" name="fecha_fin" value={convocatoria.fecha_fin} onChange={handleChange} />
            </label>
            <label>
                Tipo Convocatoria:
                <input type="number" name="id_tipoconvocatoria" value={convocatoria.id_tipoconvocatoria} onChange={handleChange} />
            </label>
            <label>
                Carrera:
                <input type="number" name="id_carrera" value={convocatoria.id_carrera} onChange={handleChange} />
            </label>
            <label>
                Facultad:
                <input type="number" name="id_facultad" value={convocatoria.id_facultad} onChange={handleChange} />
            </label>
            <button type="submit">Siguiente</button>
        </form>
    );
};

export default ConvocatoriaForm;