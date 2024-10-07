// frontend/src/components/ConvocatoriaForm.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Card, CardBody, CardTitle, Button, Form, FormGroup, Label, Input, Row, Col } from 'reactstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../Global.css';

const ConvocatoriaForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [convocatoria, setConvocatoria] = useState({
        nombre: '',
        fecha_inicio: null,
        fecha_fin: null,
        id_tipoconvocatoria: '',
        id_carrera: '',
        id_facultad: ''
    });

    const [tiposConvocatoria, setTiposConvocatoria] = useState([]);
    const [carreras, setCarreras] = useState([]);
    const [facultades, setFacultades] = useState([]);
    const [tituloConvocatoria, setTituloConvocatoria] = useState('');
    const [prioridad, setPrioridad] = useState('PRIMERA');
    const [horario, setHorario] = useState('TIEMPO COMPLETO');
    const [gestion, setGestion] = useState('GESTION 1');
    const currentYear = new Date().getFullYear();

    useEffect(() => {
        const today = new Date();
        if (!id) {
            setConvocatoria((prevConvocatoria) => ({
                ...prevConvocatoria,
                fecha_inicio: today,
            }));
        }
        if (id) {
            const fetchConvocatoria = async () => {
                try {
                    const response = await axios.get(`http://localhost:5000/convocatorias/${id}`);
                    const data = response.data;
                    setConvocatoria({
                        ...data,
                        fecha_inicio: data.fecha_inicio ? new Date(data.fecha_inicio) : null,
                        fecha_fin: data.fecha_fin ? new Date(data.fecha_fin) : null,
                    });
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
                    axios.get('http://localhost:5000/facultades'),
                ]);
                console.log('Tipos de Convocatoria:', tiposResponse.data); // Verificar que la data sea correcta
                setTiposConvocatoria(tiposResponse.data);
                setCarreras(carrerasResponse.data);
                setFacultades(facultadesResponse.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [id]);

    const handleTipoConvocatoriaChange = (e) => {
        const tipoId = e.target.value;
        setConvocatoria((prevConvocatoria) => ({
            ...prevConvocatoria,
            id_tipoconvocatoria: tipoId,
        }));

        // Encuentra el tipo de convocatoria seleccionado para obtener el título
        const selectedTipo = tiposConvocatoria.find(tipo => tipo.id_tipoconvocatoria === parseInt(tipoId));
        setTituloConvocatoria(selectedTipo ? selectedTipo.titulo : ''); // Asegúrate de que estás usando la propiedad correcta
        handleNombreAutoFill(); // Actualiza el nombre de convocatoria
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setConvocatoria((prevConvocatoria) => ({
            ...prevConvocatoria,
            [name]: value,
        }));
        handleNombreAutoFill(); // Actualiza el nombre automáticamente al cambiar la carrera
    };

    const handleDateChange = (name, date) => {
        setConvocatoria((prevConvocatoria) => ({
            ...prevConvocatoria,
            [name]: date,
        }));
    };

    const handleNombreAutoFill = () => {
        const carreraNombre = carreras.find(c => c.id_carrera === parseInt(convocatoria.id_carrera))?.nombre_carrera || '';
        const nombreCompleto = `${prioridad} ${tituloConvocatoria} ${horario} PARA LA CARRERA DE ${carreraNombre} ${gestion}/${currentYear}`;
    
        setConvocatoria((prevConvocatoria) => ({
            ...prevConvocatoria,
            nombre: nombreCompleto
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        handleNombreAutoFill();
    
        const formattedConvocatoria = {
            ...convocatoria,
            prioridad, // Agregar prioridad
            fecha_inicio: convocatoria.fecha_inicio ? convocatoria.fecha_inicio.toISOString().split('T')[0] : null,
            fecha_fin: convocatoria.fecha_fin ? convocatoria.fecha_fin.toISOString().split('T')[0] : null,
        };
    
        try {
            if (id) {
                await axios.put(`http://localhost:5000/convocatorias/${id}`, formattedConvocatoria);
                navigate('/convocatorias');
            } else {
                const response = await axios.post('http://localhost:5000/convocatorias', formattedConvocatoria);
                const newConvocatoriaId = response.data.id_convocatoria;
                navigate(`/convocatorias_materias/new/${newConvocatoriaId}`);
            }
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    return (
        <div>
            <Container >
                <Row className="mb-4">
                    <Col>
                        <h1 className="text-center">{id ? 'Editar' : 'Registrar'} Convocatoria</h1>
                    </Col>
                </Row>
                <Row>
                    <Col sm="12" md="8" lg="6" className="mx-auto">
                        <Card className="card-custom">
                            <CardBody>
                                <CardTitle tag="h5" className="text-center mb-4">Formulario de Convocatoria</CardTitle>
                                <Form onSubmit={handleSubmit}>
                                    <FormGroup>
                                        <Label for="id_tipoconvocatoria">Tipo de Convocatoria</Label>
                                        <Input
                                            type="select"
                                            name="id_tipoconvocatoria"
                                            id="id_tipoconvocatoria"
                                            value={convocatoria.id_tipoconvocatoria}
                                            onChange={handleTipoConvocatoriaChange}
                                            required
                                        >
                                            <option value="">Seleccione un tipo</option>
                                            {tiposConvocatoria.map((tipo) => (
                                                <option key={tipo.id_tipoconvocatoria} value={tipo.id_tipoconvocatoria}>
                                                    {tipo.nombre_convocatoria}
                                                </option>
                                            ))}
                                        </Input>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="nombre">Nombre de Convocatoria</Label>
                                        <Input
                                            type="textarea" // Cambiar a textarea para un cuadro más grande
                                            name="nombre"
                                            id="nombre"
                                            value={convocatoria.nombre}
                                            readOnly
                                            required
                                            style={{ height: '200px' }} // Ajustar la altura como desees
                                        />
                                    </FormGroup>
                                    <FormGroup>
                                        <Label>Prioridad</Label>
                                        <Input type="select" value={prioridad} onChange={(e) => { setPrioridad(e.target.value); handleNombreAutoFill(); }}>
                                            <option>Primera</option>
                                            <option>Segunda</option>
                                            <option>Tercera</option>
                                            <option>Cuarta</option>
                                            <option>Quinta</option>
                                        </Input>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label>Horario</Label>
                                        <Input type="select" value={horario} onChange={(e) => { setHorario(e.target.value); handleNombreAutoFill(); }}>
                                            <option>TIEMPO COMPLETO</option>
                                            <option>TIEMPO HORARIO</option>
                                        </Input>
                                    </FormGroup>
                                    <Row>
                                        <Col>
                                            <FormGroup>
                                                <Label for="fecha_inicio">Fecha de Inicio</Label>
                                                <DatePicker
                                                    selected={convocatoria.fecha_inicio}
                                                    dateFormat="yyyy-MM-dd"
                                                    className="form-control"
                                                    readOnly
                                                    required
                                                />
                                            </FormGroup>
                                        </Col>
                                        <Col>
                                            <FormGroup>
                                                <Label for="fecha_fin">Fecha de Fin</Label>
                                                <DatePicker
                                                    selected={convocatoria.fecha_fin}
                                                    onChange={(date) => handleDateChange('fecha_fin', date)}
                                                    dateFormat="yyyy-MM-dd"
                                                    className="form-control"
                                                    required
                                                />
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <FormGroup>
                                                <Label for="id_carrera">Carrera</Label>
                                                <Input
                                                    type="select"
                                                    name="id_carrera"
                                                    id="id_carrera"
                                                    value={convocatoria.id_carrera}
                                                    onChange={(e) => { handleChange(e); handleNombreAutoFill(); }}
                                                    required
                                                >
                                                    <option value="">Seleccione una carrera</option>
                                                    {carreras.map((carrera) => (
                                                        <option key={carrera.id_carrera} value={carrera.id_carrera}>
                                                            {carrera.nombre_carrera}
                                                        </option>
                                                    ))}
                                                </Input>
                                            </FormGroup>
                                        </Col>
                                        <Col>
                                            <FormGroup>
                                                <Label for="id_facultad">Facultad</Label>
                                                <Input
                                                    type="select"
                                                    name="id_facultad"
                                                    id="id_facultad"
                                                    value={convocatoria.id_facultad}
                                                    onChange={handleChange}
                                                    required
                                                >
                                                    <option value="">Seleccione una facultad</option>
                                                    {facultades.map((facultad) => (
                                                        <option key={facultad.id_facultad} value={facultad.id_facultad}>
                                                            {facultad.nombre_facultad}
                                                        </option>
                                                    ))}
                                                </Input>
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    <FormGroup>
                                        <Label>Gestión</Label>
                                        <Input
                                            type="select"
                                            value={gestion}
                                            onChange={(e) => { setGestion(e.target.value); handleNombreAutoFill(); }}
                                        >
                                            <option>GESTION 1</option>
                                            <option>GESTION 2</option>
                                        </Input>
                                    </FormGroup>
                                    <Button
                                        color="primary"
                                        type="submit"
                                        className="mt-3"
                                    >
                                        {id ? 'Actualizar' : 'Siguiente'}
                                    </Button>
                                </Form>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default ConvocatoriaForm;
