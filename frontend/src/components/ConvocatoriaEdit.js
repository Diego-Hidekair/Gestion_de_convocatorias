//frontend/src/components/ConvocatoriaEdit
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ConvocatoriaEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [convocatoria, setConvocatoria] = useState({
        cod_convocatoria: '',
        Nombre: '',
        Fecha_inicio: '',
        Fecha_fin: '',
        id_tipoconvocatoria: '',
        id_carrera: '',
        id_facultad: ''
    });

    useEffect(() => {
        const fetchConvocatoria = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/convocatorias/${id}`);
                setConvocatoria(response.data);
            } catch (error) {
                console.error('Error al obtener la convocatoria:', error);
            }
        };
        fetchConvocatoria();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setConvocatoria({ ...convocatoria, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:5000/convocatorias/${id}`, convocatoria);
            navigate('/convocatorias');
        } catch (error) {
            console.error('Error al actualizar convocatoria:', error);
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
                <input type="text" name="Nombre" value={convocatoria.Nombre} onChange={handleChange} />
            </label>
            <label>
                Fecha Inicio:
                <input type="date" name="Fecha_inicio" value={convocatoria.Fecha_inicio} onChange={handleChange} />
            </label>
            <label>
                Fecha Fin:
                <input type="date" name="Fecha_fin" value={convocatoria.Fecha_fin} onChange={handleChange} />
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
            <button type="submit">Actualizar Convocatoria</button>
        </form>
    );
};

export default ConvocatoriaEdit;
