// src/components/TipoconvocatoriaList.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Container, Card, CardBody, CardTitle, CardText, Button, Row, Col } from 'reactstrap';
import { BsTrashFill } from "react-icons/bs";
import { PiPencilLineBold } from "react-icons/pi";
import '../Global.css';

const TipoconvocatoriaList = () => {
    const [tiposConvocatoria, setTiposConvocatoria] = useState([]);

    useEffect(() => {
        const fetchTiposConvocatoria = async () => {
            try {
                const response = await axios.get('http://localhost:5000/tipo-convocatorias');
                console.log(response.data);
                setTiposConvocatoria(response.data);
            } catch (error) {
                console.error('Error al obtener los tipos de convocatoria:', error);
            }
        };
        fetchTiposConvocatoria();
    }, []);

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/tipo-convocatorias/${id}`);
            setTiposConvocatoria(tiposConvocatoria.filter(tipo => tipo.id_tipoconvocatoria !== id));
        } catch (error) {
            console.error('Error al eliminar el tipo de convocatoria:', error);
        }
    };

    return (
        <div className="degraded-background">
            <Container className="container-list">
                <Row className="mb-4">
                    <Col>
                        <h1 className="text-center">Lista de Tipos de Convocatoria</h1>
                    </Col>
                </Row>
                <Row className="mb-3">
                    <Col className="text-center">
                        <Button color="primary" tag={Link} to="/tipoconvocatorias/crear">
                            Crear Nuevo Tipo de Convocatoria
                        </Button>
                    </Col>
                </Row>

                <Row>
                    {tiposConvocatoria.map((tipo) => (
                        <Col sm="12" md="4" lg="4" key={tipo.id_tipoconvocatoria} className="mb-4">
                            <Card className="card-custom">
                            <CardBody className="d-flex flex-column justify-content-between">
                                    <CardTitle tag="h5" className="text-center">
                                        {tipo.nombre_convocatoria} {/* Cambia aquí si es necesario */}
                                    </CardTitle>
                                    <div className="d-flex justify-content-between mt-3 button-group">
                                        <Button color="warning" size="sm" tag={Link} to={`/tipoconvocatorias/editar/${tipo.id_tipoconvocatoria}`}>  
                                            <PiPencilLineBold className="icon" /> Editar
                                        </Button>
                                        <Button color="danger" size="sm" onClick={() => handleDelete(tipo.id_tipoconvocatoria)} className="custom-button">
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

export default TipoconvocatoriaList;
