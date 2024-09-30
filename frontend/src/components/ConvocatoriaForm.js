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

    useEffect(() => {
        const today = new Date();
        if (!id) { // Si no está editando una convocatoria existente
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

    const handleDateChange = (name, date) => {
        setConvocatoria((prevConvocatoria) => ({
            ...prevConvocatoria,
            [name]: date,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formattedConvocatoria = {
                ...convocatoria,
                fecha_inicio: convocatoria.fecha_inicio ? convocatoria.fecha_inicio.toISOString().split('T')[0] : null,
                fecha_fin: convocatoria.fecha_fin ? convocatoria.fecha_fin.toISOString().split('T')[0] : null,
            };
            if (id) {
                await axios.put(`http://localhost:5000/convocatorias/${id}`, formattedConvocatoria);
                navigate('/convocatorias');
            } else {
                const response = await axios.post('http://localhost:5000/convocatorias', formattedConvocatoria);
                const newConvocatoriaId = response.data.id_convocatoria; // Asegúrate de que el backend devuelve el id
                navigate(`/convocatorias_materias/new/${newConvocatoriaId}`); // Ruta corregida
            }
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    return (
        <div className="degraded-background">
            <Container className="container-list">
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
                                        <Label for="nombre">Nombre</Label>
                                        <Input
                                            type="text"
                                            name="nombre"
                                            id="nombre"
                                            value={convocatoria.nombre}
                                            onChange={handleChange}
                                            required
                                        />
                                    </FormGroup>
                                    <Row>
                                        <Col>
                                            <FormGroup>
                                                <Label for="fecha_inicio">Fecha de Inicio</Label>
                                                <DatePicker
                                                    selected={convocatoria.fecha_inicio}
                                                    dateFormat="yyyy-MM-dd"
                                                    className="form-control"
                                                    readOnly // Deshabilita el campo para que no sea editable
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
                                    <FormGroup>
                                        <Label for="id_tipoconvocatoria">Tipo de Convocatoria</Label>
                                        <Input
                                            type="select"
                                            name="id_tipoconvocatoria"
                                            id="id_tipoconvocatoria"
                                            value={convocatoria.id_tipoconvocatoria}
                                            onChange={handleChange}
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
                                    <Row>
                                        <Col>
                                            <FormGroup>
                                                <Label for="id_carrera">Carrera</Label>
                                                <Input
                                                    type="select"
                                                    name="id_carrera"
                                                    id="id_carrera"
                                                    value={convocatoria.id_carrera}
                                                    onChange={handleChange}
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
                                    <Button color="primary" type="submit" className="mt-3">
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
