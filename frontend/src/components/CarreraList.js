// frontend/src/components/CarreraList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Card, CardBody, CardTitle, Row, Col } from 'reactstrap'; // No necesitas el botón
import '../styles/carrera.css';

const CarreraList = ({ isOpen }) => { 
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

    return (
        <div className={`carrera-list-container ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}> 
            <Container className="contenedor-lista-carrera">
                <div className="titulo-carrera-rectangulo">
                    <h1 className="text-titulo">Lista de Carreras</h1>
                </div>

                <Row className="cuadros-informacion">
                    {carreras.map((carrera) => (
                        <Col sm="12" md="4" lg="4" key={carrera.id_programa} className="mb-4-carrera">
                            <Card className="cuadro-carrera">
                                <CardBody className="body-carrera">
                                    <CardTitle tag="h5" className="text-center-carrera">
                                        {carrera.nombre_carrera}
                                    </CardTitle>
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
