//frontend/src/components/FacultadList.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Container, Card, CardBody, CardTitle, Button, Row, Col } from 'reactstrap';
import { BsTrashFill } from "react-icons/bs"; // Ícono de eliminar
import { PiPencilLineBold } from "react-icons/pi"; // Ícono de editar
import '../Global.css';  // Importa el archivo CSS global

const FacultadList = () => {
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

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/facultades/${id}`);
            setFacultades(facultades.filter(facultad => facultad.id_facultad !== id));
        } catch (error) {
            console.error('Error al eliminar la facultad:', error);
        }
    };

    return (
        <div >
            <Container className="container-list">
                <Row className="mb-4">
                    <Col>
                        <h1 className="text-center">Lista de Facultades</h1>
                    </Col>
                </Row>
                <Row className="mb-3">
                    <Col className="text-center">
                        <Button color="primary" tag={Link} to="/facultades/new">
                            Crear Nueva Facultad
                        </Button>
                    </Col>
                </Row>

                <Row>
                    {facultades.map((facultad) => (
                        <Col sm="12" md="4" lg="4" key={facultad.id_facultad} className="mb-4">
                            <Card className="card-custom">
                                <CardBody className="d-flex flex-column justify-content-between">
                                    <CardTitle tag="h5" className="text-center">
                                        {facultad.nombre_facultad}
                                    </CardTitle>
                                    <div className="d-flex justify-content-between mt-3 button-group">
                                        <Button color="warning" size="sm" tag={Link} to={`/facultades/edit/${facultad.id_facultad}`} className="custom-button">
                                            <PiPencilLineBold className="icon" /> Editar
                                        </Button>
                                        <Button color="danger" size="sm" onClick={() => handleDelete(facultad.id_facultad)} className="custom-button">
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

export default FacultadList;