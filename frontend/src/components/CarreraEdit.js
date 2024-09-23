// src/components/CarreraEdit.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Form, FormGroup, Label, Input, Button, Row, Col } from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const CarreraEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [carrera, setCarrera] = useState({ nombre_carrera: '', cod_facultad: '' });
    const [facultades, setFacultades] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCarrera = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/carreras/${id}`);
                setCarrera(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error al obtener la carrera:', error);
                setLoading(false);
            }
        };

        const fetchFacultades = async () => {
            try {
                const response = await axios.get('http://localhost:5000/facultades');
                setFacultades(response.data);
            } catch (error) {
                console.error('Error al obtener las facultades:', error);
            }
        };

        fetchCarrera();
        fetchFacultades();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCarrera({ ...carrera, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:5000/carreras/${id}`, carrera);
            navigate('/carreras');
        } catch (error) {
            console.error('Error al actualizar la carrera:', error);
        }
    };

    if (loading) {
        return <div>Cargando...</div>;
    }

    return (
        <Container className="my-5">
            <Row className="mb-4">
                <Col>
                    <h1 className="text-center">Editar Carrera</h1>
                </Col>
            </Row>
            <Row className="justify-content-center">
                <Col md={6}>
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
                                <option value="">Seleccione una facultad</option>
                                {facultades.map(facultad => (
                                    <option key={facultad.id_facultad} value={facultad.id_facultad}>
                                        {facultad.nombre_facultad}
                                    </option>
                                ))}
                            </Input> 
                            </FormGroup>
                            <Button color="primary" block type="submit"> 
                                Actualizar Carrera 
                            </Button> 
                    </Form>
                </Col> 
            </Row> 
        </Container> 
    ); 
};
export default CarreraEdit;
                    