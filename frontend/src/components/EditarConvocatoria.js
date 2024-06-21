import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const EditarConvocatoria = () => {
    const { id } = useParams();
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
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            const convocatoriaRes = await axios.get(`http://localhost:5000/api/convocatorias/${id}`);
            setConvocatoria(convocatoriaRes.data);
            const tiposRes = await axios.get('http://localhost:5000/api/tipoconvocatorias');
            setTiposConvocatoria(tiposRes.data);
            const carrerasRes = await axios.get('http://localhost:5000/api/carreras');
            setCarreras(carrerasRes.data);
            const facultadesRes = await axios.get('http://localhost:5000/api/facultades');
            setFacultades(facultadesRes.data);
        };
        fetchData();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setConvocatoria({ ...convocatoria, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:5000/api/convocatorias/${id}`, convocatoria);
            navigate('/convocatorias');
        } catch (error) {
            console.error('Error al actualizar la convocatoria:', error);
        }
    };

    return (
        <div>
            <h2>Editar Convocatoria</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="cod_convocatoria"
                    placeholder="Código de Convocatoria"
                    value={convocatoria.cod_convocatoria}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="nombre"
                    placeholder="Nombre"
                    value={convocatoria.nombre}
                    onChange={handleChange}
                    required
                />
                <input
                    type="date"
                    name="fecha_inicio"
                    value={convocatoria.fecha_inicio}
                    onChange={handleChange}
                    required
                />
                <input
                    type="date"
                    name="fecha_fin"
                    value={convocatoria.fecha_fin}
                    onChange={handleChange}
                />
                <select
                    name="id_tipoconvocatoria"
                    value={convocatoria.id_tipoconvocatoria}
                    onChange={handleChange}
                    required
                >
                    <option value="">Selecciona Tipo de Convocatoria</option>
                    {tiposConvocatoria.map(tipo => (
                        <option key={tipo.id_tipoconvocatoria} value={tipo.id_tipoconvocatoria}>
                            {tipo.nombre_convocatoria}
                        </option>
                    ))}
                </select>
                <select
                    name="id_carrera"
                    value={convocatoria.id_carrera}
                    onChange={handleChange}
                >
                    <option value="">Selecciona Carrera</option>
                    {carreras.map(carrera => (
                        <option key={carrera.id_carrera} value={carrera.id_carrera}>
                            {carrera.nombre_carrera}
                        </option>
                    ))}
                </select>
                <select
                    name="id_facultad"
                    value={convocatoria.id_facultad}
                    onChange={handleChange}
                >
                    <option value="">Selecciona Facultad</option>
                    {facultades.map(facultad => (
                        <option key={facultad.id_facultad} value={facultad.id_facultad}>
                            {facultad.nombre_facultad}
                        </option>
                    ))}
                </select>
                <button type="submit">Actualizar Convocatoria</button>
            </form>
        </div>
    );
};

export default EditarConvocatoria;
