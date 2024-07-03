// src/components/ConvocatoriaForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ConvocatoriaForm = () => {
    const [formData, setFormData] = useState({
        nombre: '',
        fechaInicio: '',
        fechaFin: '',
        tipoConvocatoria: '',
        carrera: '',
        facultad: '',
        materias: [],
        creadoPor: 'Admin'
    });
    const [materiasDisponibles, setMateriasDisponibles] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMaterias = async () => {
            try {
                const response = await axios.get('http://localhost:5000/materias');
                setMateriasDisponibles(response.data);
            } catch (error) {
                console.error('Error al obtener las materias:', error);
            }
        };

        fetchMaterias();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleMateriasChange = (e) => {
        const { options } = e.target;
        const selectedMaterias = [];
        for (let i = 0, l = options.length; i < l; i++) {
            if (options[i].selected) {
                selectedMaterias.push(options[i].value);
            }
        }
        setFormData({
            ...formData,
            materias: selectedMaterias
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/convocatorias', formData);
            navigate('/convocatorias');
        } catch (error) {
            console.error('Error al guardar la convocatoria:', error);
        }
    };

    return (
        <div className="container">
            <h1>Crear Nueva Convocatoria</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Nombre:
                    <input
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                    />
                </label>
                <label>
                    Fecha de Inicio:
                    <input
                        type="date"
                        name="fechaInicio"
                        value={formData.fechaInicio}
                        onChange={handleChange}
                    />
                </label>
                <label>
                    Fecha de Fin:
                    <input
                        type="date"
                        name="fechaFin"
                        value={formData.fechaFin}
                        onChange={handleChange}
                    />
                </label>
                <label>
                    Tipo de Convocatoria:
                    <input
                        type="text"
                        name="tipoConvocatoria"
                        value={formData.tipoConvocatoria}
                        onChange={handleChange}
                    />
                </label>
                <label>
                    Carrera:
                    <input
                        type="text"
                        name="carrera"
                        value={formData.carrera}
                        onChange={handleChange}
                    />
                </label>
                <label>
                    Facultad:
                    <input
                        type="text"
                        name="facultad"
                        value={formData.facultad}
                        onChange={handleChange}
                    />
                </label>
                <label>
                    Materias:
                    <select multiple value={formData.materias} onChange={handleMateriasChange}>
                        {materiasDisponibles.map((materia) => (
                            <option key={materia.id_materia} value={materia.nombre}>
                                {materia.nombre}
                            </option>
                        ))}
                    </select>
                </label>
                <button type="submit">Crear</button>
            </form>
        </div>
    );
};

export default ConvocatoriaForm;
/*// frontend/src/components/ConvocatoriaForm.js
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
        <form  className="container" onSubmit={handleSubmit}>
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

export default ConvocatoriaForm;*/