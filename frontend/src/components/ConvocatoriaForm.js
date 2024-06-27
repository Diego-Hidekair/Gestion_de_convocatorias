// frontend/src/components/ConvocatoriaForm.js
import React, { useState, useEffect } from 'react';
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
    const [tiposConvocatoria, setTiposConvocatoria] = useState([]);
    const [carreras, setCarreras] = useState([]);
    const [facultades, setFacultades] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const tiposResponse = await axios.get('http://localhost:5000/tipoConvocatoria');
                setTiposConvocatoria(tiposResponse.data);
                const carrerasResponse = await axios.get('http://localhost:5000/carreras');
                setCarreras(carrerasResponse.data);
                const facultadesResponse = await axios.get('http://localhost:5000/facultades');
                setFacultades(facultadesResponse.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setConvocatoria({ ...convocatoria, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/convocatorias', convocatoria);
            const newConvocatoriaId = response.data.id_convocatoria;
            if (newConvocatoriaId) {
                navigate(`/convocatorias/${newConvocatoriaId}/materias`);
            } else {
                console.error('No se recibió un ID válido para la nueva convocatoria');
            }
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
                <select name="id_tipoconvocatoria" value={convocatoria.id_tipoconvocatoria} onChange={handleChange}>
                    <option value="">Seleccione un tipo</option>
                    {tiposConvocatoria.map(tipo => (
                        <option key={tipo.id_tipoconvocatoria} value={tipo.id_tipoconvocatoria}>
                            {tipo.nombre_convocatoria}
                        </option>
                    ))}
                </select>
            </label>
            <label>
                Carrera:
                <select name="id_carrera" value={convocatoria.id_carrera} onChange={handleChange}>
                    <option value="">Seleccione una carrera</option>
                    {carreras.map(carrera => (
                        <option key={carrera.id_carrera} value={carrera.id_carrera}>
                            {carrera.nombre_carrera}
                        </option>
                    ))}
                </select>
            </label>
            <label>
                Facultad:
                <select name="id_facultad" value={convocatoria.id_facultad} onChange={handleChange}>
                    <option value="">Seleccione una facultad</option>
                    {facultades.map(facultad => (
                        <option key={facultad.id_facultad} value={facultad.id_facultad}>
                            {facultad.nombre_facultad}
                        </option>
                    ))}
                </select>
            </label>
            <button type="submit">Siguiente</button>
        </form>
    );
};

export default ConvocatoriaForm;