// frontend/src/components/ConvocatoriaForm.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Card, CardBody, CardTitle, Button, Form, FormGroup, Label, Row, Col, Input } from 'reactstrap';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (id) {
                await axios.put(`http://localhost:5000/convocatorias/${id}`, convocatoria);
            } else {
                await axios.post('http://localhost:5000/convocatorias', convocatoria);
            }
            navigate('/convocatorias');
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
                                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                                        <Row>
                                            <Col>
                                                <FormGroup>
                                                    <Label for="fecha_inicio">Fecha de Inicio</Label>
                                                    <DatePicker
                                                        value={convocatoria.fecha_inicio}
                                                        onChange={(newDate) => setConvocatoria({ ...convocatoria, fecha_inicio: newDate })}
                                                        renderInput={(params) => <Input {...params} />}
                                                    />
                                                </FormGroup>
                                            </Col>
                                            <Col>
                                                <FormGroup>
                                                    <Label for="fecha_fin">Fecha de Fin</Label>
                                                    <DatePicker
                                                        value={convocatoria.fecha_fin}
                                                        onChange={(newDate) => setConvocatoria({ ...convocatoria, fecha_fin: newDate })}
                                                        renderInput={(params) => <Input {...params} />}
                                                    />
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                    </LocalizationProvider>
                                    {/* Resto del formulario... */}
                                    <Button color="primary" type="submit" className="mt-3">
                                        {id ? 'Actualizar' : 'Registrar'}
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