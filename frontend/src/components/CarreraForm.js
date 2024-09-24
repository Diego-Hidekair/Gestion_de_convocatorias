// src/components/CarreraForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Form, FormGroup, Label, Input, Button, Row, Col } from 'reactstrap';
import '../Global.css';  // Importa el archivo CSS global
import 'bootstrap/dist/css/bootstrap.min.css';

const CarreraForm = () => {
    const navigate = useNavigate();
    const [carrera, setCarrera] = useState({ nombre_carrera: '', cod_facultad: '' });
    const [facultades, setFacultades] = useState([]);

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
        try {
            await axios.post('http://localhost:5000/carreras', carrera);
            navigate('/carreras');
        } catch (error) {
            console.error('Error al crear carrera:', error);
        }
    };

    return (
        <div className="degraded-background">
            <Container>
                <Row className="mb-4">
                    <Col>
                        <h1 className="text-center">Crear Nueva Carrera</h1>
                    </Col>
                </Row>
                <Row className="justify-content-center">
                    <Col md={6}>
                        <div className="card-content">
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
                                            <option key={facultad.cod_facultad} value={facultad.cod_facultad}>
                                                {facultad.nombre_facultad}
                                            </option>
                                        ))}
                                    </Input>
                                </FormGroup>
                                <Button color="primary" type="submit" block className="custom-button">
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