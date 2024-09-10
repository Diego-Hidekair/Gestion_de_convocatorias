// frontend/src/components/ConvocatoriaForm.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const ConvocatoriaForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [convocatoria, setConvocatoria] = useState({
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
        if (id) {
            const fetchConvocatoria = async () => {
                try {
                    const response = await axios.get(`http://localhost:5000/convocatorias/${id}`);
                    setConvocatoria(response.data);
                } catch (error) {
                    console.error('Error fetching convocatoria:', error);
                }
            };
            fetchConvocatoria();
        }

        const fetchData = async () => {
            try {
                const [tiposResponse, carrerasResponse, facultadesResponse] = await Promise.all([
                    axios.get('http://localhost:5000/tipo-convocatorias'),
                    axios.get('http://localhost:5000/carreras'),
                    axios.get('http://localhost:5000/facultades')
                ]);
                setTiposConvocatoria(tiposResponse.data);
                setCarreras(carrerasResponse.data);
                setFacultades(facultadesResponse.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setConvocatoria((prevConvocatoria) => ({
            ...prevConvocatoria,
            [name]: value,
        }));
    };

    const handleChangeDate = (name, date) => {
        setConvocatoria(prevConvocatoria => ({
            ...prevConvocatoria,
            [name]: date.toISOString()
        }));
    };
 
    
 
    const handleSubmit = async (e) => {
        e.preventDefault();
    
        try {
            const response = await axios.post('/convocatorias', convocatoria);
            const newConvocatoriaId = response.data.id_convocatoria;
    
            // Redirigir a la página de materias con el ID de la convocatoria recién creada
            navigate(`/convocatorias_materias/new`);
        } catch (error) {
            console.error("Error creando la convocatoria:", error);
        }
    };

    return (
        <div className="container mt-4">
            <h2>Datos de Convocatoria</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">Título de Convocatoria:</label>
                    <textarea
                        name="nombre"
                        className="form-control"
                        rows="4"
                        value={convocatoria.nombre}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3 row">
                    <div className="col-md-6">
                        <label className="form-label">Fecha de publicacion:</label>
                        <DatePicker
                            selected={convocatoria.fecha_inicio ? new Date(convocatoria.fecha_inicio) : null}
                            onChange={date => handleChangeDate('fecha_inicio', date)}
                            className="form-control"
                            dateFormat="yyyy-MM-dd"
                            required
                        />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Fecha de conclusion:</label>
                        <DatePicker
                            selected={convocatoria.fecha_fin ? new Date(convocatoria.fecha_fin) : null}
                            onChange={date => handleChangeDate('fecha_fin', date)}
                            className="form-control"
                            dateFormat="yyyy-MM-dd"
                            required
                        />
                    </div>
                </div>
                <div className="mb-3">
                    <label className="form-label">Tipo de Convocatoria:</label>
                    <select
                        name="id_tipoconvocatoria"
                        className="form-control"
                        value={convocatoria.id_tipoconvocatoria || ''}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Seleccione un tipo</option>
                        {tiposConvocatoria.map(tipo => (
                            <option key={tipo.id_tipoconvocatoria} value={tipo.id_tipoconvocatoria}>
                                {tipo.nombre_convocatoria}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="mb-3 row">
                    <div className="col-md-6">
                        <label className="form-label">Facultad:</label>
                        <select
                            name="id_facultad"
                            className="form-control"
                            value={convocatoria.id_facultad || ''}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Seleccione una facultad</option>
                            {facultades.map(facultad => (
                                <option key={facultad.id_facultad} value={facultad.id_facultad}>
                                    {facultad.nombre_facultad}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Carrera:</label>
                        <select
                            name="id_carrera"
                            className="form-control"
                            value={convocatoria.id_carrera || ''}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Seleccione una carrera</option>
                            {carreras.map(carrera => (
                                <option key={carrera.id_carrera} value={carrera.id_carrera}>
                                    {carrera.nombre_carrera}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <button type="submit" className="btn btn-primary">
                    {id ? 'Siguiente' : 'Siguiente'}
                </button>
            </form>
        </div>
    );
};

export default ConvocatoriaForm;
