// frontend/src/components/ConvocatoriaForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Card, CardBody, CardTitle, Button, Form, FormGroup, Label, Input, Row, Col } from 'reactstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/convocatoria.css';

const ConvocatoriaForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [convocatoria, setConvocatoria] = useState({
        nombre: '',
        fecha_inicio: null,
        fecha_fin: null,
        id_tipoconvocatoria: '',
        id_programa: '',
        id_facultad: ''
    });

    const [tiposConvocatoria, setTiposConvocatoria] = useState([]);
    const [programas, setProgramas] = useState([]);
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
                const [tiposResponse, programasResponse, facultadesResponse] = await Promise.all([
                    axios.get('http://localhost:5000/tipos-convocatorias'), 
                    axios.get('http://localhost:5000/carreras'), 
                    axios.get('http://localhost:5000/facultades'), 
                ]);
                setTiposConvocatoria(tiposResponse.data);
                setProgramas(programasResponse.data); 
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

        const selectedTipo = tiposConvocatoria.find(tipo => tipo.id_tipoconvocatoria === parseInt(tipoId));
        setTituloConvocatoria(selectedTipo ? selectedTipo.titulo : '');
        handleNombreAutoFill();
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setConvocatoria((prevConvocatoria) => ({
            ...prevConvocatoria,
            [name]: value,
        }));
        handleNombreAutoFill();
    };

    const handleDateChange = (name, date) => {
        setConvocatoria((prevConvocatoria) => ({
            ...prevConvocatoria,
            [name]: date,
        }));
    };

    const handleNombreAutoFill = () => {
        const programaNombre = programas.find(p => p.id_programa === parseInt(convocatoria.id_programa))?.nombre_carrera || '';
        const nombreCompleto = `${prioridad} ${tituloConvocatoria} ${horario} PARA EL PROGRAMA DE ${programaNombre} ${gestion}/${currentYear}`;

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
            prioridad,
            fecha_inicio: convocatoria.fecha_inicio ? convocatoria.fecha_inicio.toISOString().split('T')[0] : null,
            fecha_fin: convocatoria.fecha_fin ? convocatoria.fecha_fin.toISOString().split('T')[0] : null,
            horario,
            gestion
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
            alert('Hubo un error al crear la convocatoria. Por favor, revisa los datos.');
        }
    };

return (
        <div>
            <Container className="container-list-convocatoria">
                <Row className="mb-4-convocatoria">
                    <Col>
                        <h1 className="text-center-convocatoria">{id ? 'Editar' : 'Registrar'} Convocatoria</h1>
                    </Col>
                </Row>
                <Row>
                    <Col >
                        <Card className="card-custom-convocatoria"> 
                            <CardBody>
                                <CardTitle tag="h5" className="text-center-convocatoria mb-4-convocatoria">Formulario de Convocatoria</CardTitle>
                                <Form onSubmit={handleSubmit}>
                                    <FormGroup className="conv-dis">
                                        <Label for="id_tipoconvocatoria">Tipo de Convocatoria</Label>
                                        <Input
                                            type="select"
                                            name="id_tipoconvocatoria"
                                            id="id_tipoconvocatoria"
                                            className="form-select-convocatoria"
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
                                    </FormGroup >
                                    <FormGroup className="conv-dis">
                                        <Label for="nombre">Nombre de Convocatoria</Label>
                                        <Input 
                                            type="textarea" 
                                            name="nombre"
                                            id="nombre"
                                            value={convocatoria.nombre}
                                            readOnly
                                            required
                                            className="form-control-convocatoria"
                                            style={{ height: '200px' }} 
                                        />
                                    </FormGroup>
                                    <FormGroup className="conv-dis">
                                        <Label for="id_facultad">Facultad</Label>
                                        <Input
                                            type="select"
                                            name="id_facultad"
                                            id="id_facultad"
                                            className="form-select-convocatoria"
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
                                    <FormGroup className="conv-dis">
                                        <Label>Prioridad</Label>
                                        <Input
                                            type="select"
                                            value={prioridad}
                                            onChange={(e) => { setPrioridad(e.target.value); handleNombreAutoFill(); }}
                                            className="form-select-convocatoria"
                                        >
                                            <option>Primera</option>
                                            <option>Segunda</option>
                                            <option>Tercera</option>
                                            <option>Cuarta</option>
                                            <option>Quinta</option>
                                        </Input>
                                    </FormGroup>
                                    <FormGroup className="conv-dis">
                                        <Label>Horario</Label>
                                        <Input
                                            type="select"
                                            value={horario}
                                            onChange={(e) => { setHorario(e.target.value); handleNombreAutoFill(); }}
                                            className="form-select-convocatoria"
                                        >
                                            <option>TIEMPO COMPLETO</option>
                                            <option>TIEMPO HORARIO</option>
                                        </Input>
                                    </FormGroup>
                                    <Row>
                                        <Col>
                                            <FormGroup className="conv-dis">
                                                <Label for="fecha_inicio">Fecha de Inicio</Label>
                                                <DatePicker
                                                    selected={convocatoria.fecha_inicio}
                                                    dateFormat="yyyy-MM-dd"
                                                    className="form-control-convocatoria"
                                                    readOnly
                                                    required
                                                />
                                            </FormGroup>
                                        </Col>
                                        <Col>
                                            <FormGroup className="conv-dis">
                                                <Label for="fecha_fin">Fecha de Fin</Label>
                                                <DatePicker
                                                    selected={convocatoria.fecha_fin}
                                                    onChange={(date) => handleDateChange('fecha_fin', date)}
                                                    dateFormat="yyyy-MM-dd"
                                                    className="form-control-convocatoria"
                                                    required
                                                />
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    <FormGroup className="conv-dis">
                                        <Label for="id_programa">Carrera</Label>
                                        <Input
                                            type="select"
                                            name="id_programa"
                                            id="id_programa"
                                            className="form-select-convocatoria"
                                            value={convocatoria.id_programa}
                                            onChange={(e) => { handleChange(e); handleNombreAutoFill(); }}
                                            required
                                        >
                                            <option value="">Seleccione una carrera</option>
                                            {programas.map((programa) => (
                                                <option key={programa.id_programa} value={programa.id_programa}>
                                                    {programa.nombre_carrera}
                                                </option>
                                            ))}
                                        </Input>
                                    </FormGroup>
                                    <FormGroup className="conv-dis">
                                        <Label>Gestión</Label>
                                        <Input
                                            type="select"
                                            value={gestion}
                                            onChange={(e) => { setGestion(e.target.value); handleNombreAutoFill(); }}
                                            className="form-select-convocatoria"
                                        >
                                            <option>GESTION 1</option>
                                            <option>GESTION 2</option>
                                        </Input>
                                    </FormGroup>
                                    <Button
                                        color="primary"
                                        type="submit"
                                        className="custom-button-convocatoria"
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