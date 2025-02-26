import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Card, CardBody, CardTitle, Button, Form, FormGroup, Label, Input, Row, Col } from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const ConvocatoriaEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [convocatoria, setConvocatoria] = useState({
        cod_convocatoria: '',
        nombre: '',
        fecha_inicio: '',
        fecha_fin: '',
        id_tipoconvocatoria: '',
        id_carrera: '',
        id_facultad: '',
        horario: 'TIEMPO COMPLETO',
        prioridad: 'PRIMERA',
        gestion: 'GESTION 1',
    });

    const [tiposConvocatoria, setTiposConvocatoria] = useState([]);
    const [carreras, setCarreras] = useState([]);
    const [facultades, setFacultades] = useState([]);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        const fetchConvocatoria = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/convocatorias/${id}`);
                const data = response.data;
                setConvocatoria({
                    ...data,
                    fecha_inicio: data.fecha_inicio.split('T')[0], // Formatear fecha
                    fecha_fin: data.fecha_fin ? data.fecha_fin.split('T')[0] : '', // Formatear fecha
                });
            } catch (error) {
                console.error('Error fetching convocatoria:', error);
                setError('Error al cargar los datos de la convocatoria.');
            }
        };

        const fetchTiposConvocatoria = async () => {
            try {
                const response = await axios.get('http://localhost:5000/tipos-convocatorias');
                setTiposConvocatoria(response.data);
            } catch (error) {
                console.error('Error fetching tipos de convocatoria:', error);
                setError('Error al cargar los tipos de convocatoria.');
            }
        };

        const fetchCarreras = async () => {
            try {
                const response = await axios.get('http://localhost:5000/carreras');
                setCarreras(response.data);
            } catch (error) {
                console.error('Error fetching carreras:', error);
                setError('Error al cargar las carreras.');
            }
        };

        const fetchFacultades = async () => {
            try {
                const response = await axios.get('http://localhost:5000/facultades');
                setFacultades(response.data);
            } catch (error) {
                console.error('Error fetching facultades:', error);
                setError('Error al cargar las facultades.');
            }
        };

        fetchConvocatoria();
        fetchTiposConvocatoria();
        fetchCarreras();
        fetchFacultades();
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
        setError(null);
        setSuccess(null);

        try {
            // Actualizar la convocatoria
            await axios.put(`http://localhost:5000/convocatorias/${id}`, convocatoria);
            setSuccess('Convocatoria actualizada correctamente.');

            // Regenerar el PDF después de la actualización
            const pdfResponse = await axios.get(`http://localhost:5000/pdf/generar/${id}/1`);
            if (pdfResponse.status === 201) {
                setSuccess((prev) => `${prev} PDF regenerado correctamente.`);
            } else {
                setError('Hubo un error al regenerar el PDF.');
            }

            // Redirigir a la lista de convocatorias después de 2 segundos
            setTimeout(() => {
                navigate('/convocatorias');
            }, 2000);
        } catch (error) {
            console.error('Error updating convocatoria:', error);
            setError('Error al actualizar la convocatoria.');
        }
    };

    return (
        <div className="degraded-background-convocatoria">
            <Container className="container-list-convocatoria">
                <Row className="mb-4-convocatoria">
                    <Col>
                        <h1 className="text-center-convocatoria">Editar Convocatoria</h1>
                    </Col>
                </Row>
                <Row>
                    <Col sm="12" md="8" lg="6" className="mx-auto-convocatoria">
                        <Card className="card-custom-convocatoria">
                            <CardBody>
                                <CardTitle tag="h5" className="text-center-convocatoria mb-4-convocatoria">
                                    Formulario de Convocatoria
                                </CardTitle>
                                {error && <div className="alert alert-danger">{error}</div>}
                                {success && <div className="alert alert-success">{success}</div>}
                                <Form onSubmit={handleSubmit}>
                                    <FormGroup>
                                        <Label for="cod_convocatoria">Código</Label>
                                        <Input
                                            type="text"
                                            name="cod_convocatoria"
                                            id="cod_convocatoria"
                                            value={convocatoria.cod_convocatoria}
                                            onChange={handleChange}
                                            readOnly
                                        />
                                    </FormGroup>
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
                                                <Input
                                                    type="date"
                                                    name="fecha_inicio"
                                                    id="fecha_inicio"
                                                    value={convocatoria.fecha_inicio}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </FormGroup>
                                        </Col>
                                        <Col>
                                            <FormGroup>
                                                <Label for="fecha_fin">Fecha de Fin</Label>
                                                <Input
                                                    type="date"
                                                    name="fecha_fin"
                                                    id="fecha_fin"
                                                    value={convocatoria.fecha_fin}
                                                    onChange={handleChange}
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
                                    <Button color="primary" type="submit" className="mt-3-convocatoria">
                                        Actualizar
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

export default ConvocatoriaEdit;    