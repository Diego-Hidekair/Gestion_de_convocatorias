// frontend/src/components/ConvocatoriaForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ConvocatoriaForm = () => {
    const [codConvocatoria, setCodConvocatoria] = useState('');
    const [nombre, setNombre] = useState('');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [idTipoConvocatoria, setIdTipoConvocatoria] = useState('');
    const [idCarrera, setIdCarrera] = useState('');
    const [idFacultad, setIdFacultad] = useState('');
    const [tiposConvocatoria, setTiposConvocatoria] = useState([]);
    const [carreras, setCarreras] = useState([]);
    const [facultades, setFacultades] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
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
    }, []);

    /*const handleMateriaChange = (event) => {
        const selectedOptions = Array.from(event.target.selectedOptions).map(option => option.value);
        setMaterias(selectedOptions);
    };*/

    const handleSubmit = async (event) => {
        event.preventDefault();
        const convocatoriaData = {
            cod_convocatoria: codConvocatoria,
            nombre: nombre,
            fecha_inicio: fechaInicio,
            fecha_fin: fechaFin,
            id_tipoconvocatoria: idTipoConvocatoria,
            id_carrera: idCarrera,
            id_facultad: idFacultad
        };

        try {
            const response = await axios.post('http://localhost:5000/convocatorias', convocatoriaData);
            const { id_convocatoria } = response.data;
            navigate(`/pdf-generator/${id_convocatoria}`);
        } catch (error) {
            console.error('Error al crear la convocatoria:', error);
        }
    };
    
    return (
        <div className="container mt-4">
            <h2 className="mb-4">Crear Nueva Convocatoria</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">Código:</label>
                    <input
                        type="text"
                        className="form-control"
                        value={codConvocatoria}
                        onChange={(e) => setCodConvocatoria(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Nombre:</label>
                    <input
                        type="text"
                        className="form-control"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Fecha de Inicio:</label>
                    <input
                        type="date"
                        className="form-control"
                        value={fechaInicio}
                        onChange={(e) => setFechaInicio(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Fecha de Fin:</label>
                    <input
                        type="date"
                        className="form-control"
                        value={fechaFin}
                        onChange={(e) => setFechaFin(e.target.value)}
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Tipo de Convocatoria:</label>
                    <select
                        className="form-select"
                        value={idTipoConvocatoria}
                        onChange={(e) => setIdTipoConvocatoria(e.target.value)}
                        required
                    >
                        <option value="">Seleccione un tipo de convocatoria</option>
                        {tiposConvocatoria.map((tipo) => (
                            <option key={tipo.id_tipoconvocatoria} value={tipo.id_tipoconvocatoria}>
                                {tipo.nombre_convocatoria}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="mb-3">
                    <label className="form-label">Carrera:</label>
                    <select
                        className="form-select"
                        value={idCarrera}
                        onChange={(e) => setIdCarrera(e.target.value)}
                        required
                    >
                        <option value="">Seleccione una carrera</option>
                        {carreras.map((carrera) => (
                            <option key={carrera.id_carrera} value={carrera.id_carrera}>
                                {carrera.nombre_carrera}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="mb-3">
                    <label className="form-label">Facultad:</label>
                    <select
                        className="form-select"
                        value={idFacultad}
                        onChange={(e) => setIdFacultad(e.target.value)}
                        required
                    >
                        <option value="">Seleccione una facultad</option>
                        {facultades.map((facultad) => (
                            <option key={facultad.id_facultad} value={facultad.id_facultad}>
                                {facultad.nombre_facultad}
                            </option>
                        ))}
                    </select>
                </div> 
                <button type="submit" className="btn btn-primary">siguiente</button>
            </form>
        </div>
    );
};

export default ConvocatoriaForm;