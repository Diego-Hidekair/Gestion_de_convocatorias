import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const ConvocatoriaEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [nombre_convocatoria, setNombreConvocatoria] = useState('');
    const [cod_carrera, setCodCarrera] = useState('');
    const [cod_facultad, setCodFacultad] = useState('');

    useEffect(() => {
        const fetchConvocatoria = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/convocatorias/${id}`);
                setNombreConvocatoria(response.data.nombre_convocatoria);
                setCodCarrera(response.data.cod_carrera);
                setCodFacultad(response.data.cod_facultad);
            } catch (error) {
                console.error('Error al obtener la convocatoria:', error);
            }
        };

        fetchConvocatoria();
    }, [id]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            await axios.put(`http://localhost:5000/api/convocatorias/${id}`, {
                nombre_convocatoria,
                cod_carrera,
                cod_facultad
            });
            navigate('/convocatorias');
        } catch (error) {
            console.error('Error al actualizar convocatoria:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <label>
                Nombre Convocatoria:
                <input
                    type="text"
                    value={nombre_convocatoria}
                    onChange={(e) => setNombreConvocatoria(e.target.value)}
                />
            </label>
            <label>
                Código Carrera:
                <input
                    type="text"
                    value={cod_carrera}
                    onChange={(e) => setCodCarrera(e.target.value)}
                />
            </label>
            <label>
                Código Facultad:
                <input
                    type="text"
                    value={cod_facultad}
                    onChange={(e) => setCodFacultad(e.target.value)}
                />
            </label>
            <button type="submit">Actualizar</button>
        </form>
    );
};

export default ConvocatoriaEdit;
