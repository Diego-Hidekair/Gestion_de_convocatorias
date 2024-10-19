// frontend/src/components/FacultadList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Card, CardBody, CardTitle, Row, Col } from 'reactstrap';
import '../styles/facultad.css'; 

const FacultadList = ({ isOpen }) => {
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

    return (
        <div className={`container-list-container ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
            <div className="header-rectangle">
                <h1 className="text-center title-facultad">Lista de Facultades</h1>
            </div>
            <Container className="container-list">
                <Row>
                    {facultades.map((facultad) => (
                        <Col sm="12" md="4" lg="4" key={facultad.id_facultad} className="mb-4">
                            <Card className="card-custom">
                                <CardBody className="d-flex flex-column justify-content-between">
                                    <CardTitle tag="h5" className="text-center facultad-name">
                                        {facultad.nombre_facultad}
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

export default FacultadList;
