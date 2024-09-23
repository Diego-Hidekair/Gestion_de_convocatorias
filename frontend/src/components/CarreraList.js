// frontend/src/components/CarreraList.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Container, Card, CardBody, CardTitle, Button, Row, Col } from 'reactstrap';
import { BsTrashFill } from "react-icons/bs"; // Ícono de eliminar
import { PiPencilLineBold } from "react-icons/pi"; // Ícono de editar
import '../Global.css';  // Importa el archivo CSS global
import 'bootstrap/dist/css/bootstrap.min.css';

const CarreraList = () => {
    const [carreras, setCarreras] = useState([]);

    useEffect(() => {
        const fetchCarreras = async () => {
            try {
                const response = await axios.get('http://localhost:5000/carreras');
                setCarreras(response.data);
            } catch (error) {
                console.error('Error al obtener las carreras:', error);
            }
        };
        fetchCarreras();
    }, []);

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/carreras/${id}`);
            setCarreras(carreras.filter(carrera => carrera.id_carrera !== id));
        } catch (error) {
            console.error('Error al eliminar la carrera:', error);
        }
    };

    return (
        <div className="degraded-background">
            <Container className="container-list">
                <Row className="mb-4">
                    <Col>
                        <h1 className="text-center">Lista de Carreras</h1>
                    </Col>
                </Row>
                <Row className="mb-3">
                    <Col className="text-center">
                        <Button color="primary" tag={Link} to="/carreras/new">
                            Crear Nueva Carrera
                        </Button>
                    </Col>
                </Row>

                <Row>
                    {carreras.map((carrera) => (
                        <Col sm="12" md="4" lg="4" key={carrera.id_carrera} className="mb-4">
                            <Card className="card-custom">
                                <CardBody className="d-flex flex-column justify-content-between">
                                    <CardTitle tag="h5" className="text-center">
                                        {carrera.nombre_carrera}
                                    </CardTitle>
                                    <div className="d-flex justify-content-between mt-3 button-group">
                                        <Button
                                            color="warning"
                                            size="sm"
                                            tag={Link}
                                            to={`/carreras/edit/${carrera.id_carrera}`}
                                            className="custom-button"
                                        >
                                            <PiPencilLineBold className="icon" /> Editar
                                        </Button>
                                        <Button
                                            color="danger"
                                            size="sm"
                                            onClick={() => handleDelete(carrera.id_carrera)}
                                            className="custom-button"
                                        >
                                            <BsTrashFill className="icon" /> Eliminar
                                        </Button>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>
        </div>
    );
};

export default CarreraList;
