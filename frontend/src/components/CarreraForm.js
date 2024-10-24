// src/components/CarreraForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Solo usar useNavigate
import { Container, Form, FormGroup, Label, Input, Button, Row, Col, Alert } from 'reactstrap'; // Importar Alert
import '../Global.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const CarreraForm = () => {
    const navigate = useNavigate(); // Inicializar useNavigate correctamente
    const [carrera, setCarrera] = useState({ nombre_carrera: '', cod_facultad: '' });
    const [facultades, setFacultades] = useState([]);
    const [successMessage, setSuccessMessage] = useState(''); // Estado para el mensaje de éxito

    useEffect(() => {
        const fetchFacultades = async () => {
            try {
                const response = await axios.get('http://localhost:5000/facultades');
                setFacultades(response.data);
            } catch (error) {
                console.error('Error al obtener las facultades:', error);
            }
        };
        fetchFacultades();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCarrera({ ...carrera, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const carreraData = {
            nombre_carrera: carrera.nombre_carrera,
            cod_facultad: carrera.cod_facultad,
        };
        console.log("Datos a enviar:", carreraData);

        try {
            const response = await axios.post('http://localhost:5000/carreras', carreraData);
            console.log("Respuesta del servidor:", response.data);

            // Mostrar mensaje de éxito
            setSuccessMessage('Carrera creada exitosamente!');

            // Redirigir después de 3 segundos
            setTimeout(() => {
                setSuccessMessage('');  // Limpiar el mensaje de éxito
                navigate('/carreras');  // Redirigir a la lista de carreras
            }, 3000);  // Esperar 3 segundos antes de redirigir
        } catch (error) {
            console.error("Error al crear carrera:", error);
        }
    };

    return (
        <div className="degraded-background-carrera">
            <Container>
                <Row className="mb-4-carrera">
                    <Col>
                        <h1 className="text-center-carera">Crear Nueva Carrera</h1>
                    </Col>
                </Row>
                {successMessage && (  // Mostrar el mensaje de éxito si existe
                    <Row>
                        <Col>
                            <Alert color="success" className="text-center-carrera">
                                {successMessage}
                            </Alert>
                        </Col>
                    </Row>
                )}
                <Row className="justify-content-center-carrera">
                    <Col md={6}>
                        <div className="cuadro-carrera">
                            <Form onSubmit={handleSubmit}>
                                <FormGroup>
                                    <Label for="nombre_carrera">Nombre de la Carrera</Label>
                                    <Input
                                        type="text"
                                        name="nombre_carrera"
                                        id="nombre_carrera"
                                        value={carrera.nombre_carrera}
                                        onChange={handleChange}
                                        required
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <Label for="cod_facultad">Facultad</Label>
                                    <Input
                                        type="select"
                                        name="cod_facultad"
                                        id="cod_facultad"
                                        value={carrera.cod_facultad}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Seleccione una Facultad</option>
                                        {facultades.map(facultad => (
                                            <option key={facultad.id_facultad} value={facultad.id_facultad}>
                                                {facultad.nombre_facultad}
                                            </option>
                                        ))}
                                    </Input>
                                </FormGroup>
                                <Button color="primary" type="submit" block className="custom-button-carrera">
                                    Guardar
                                </Button>
                            </Form>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default CarreraForm;
