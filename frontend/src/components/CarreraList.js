// frontend/src/components/CarreraList.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Container, Card, CardBody, CardTitle, Button, Row, Col } from 'reactstrap';
import { BsTrashFill } from "react-icons/bs";
import { PiPencilLineBold } from "react-icons/pi";
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

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/carreras/${id}`);
            setCarreras(carreras.filter(carrera => carrera.id_carrera !== id));
        } catch (error) {
            console.error('Error al eliminar la carrera:', error);
        }
    };

    return (
        <div className={`carrera-list-container ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}> 
            <Container className="contenedor-lista-carrera">
                <div className="titulo-carrera-rectangulo">
                    <h1 className="text-titulo">Lista de Carreras</h1>
                </div>
                <Row className="mb-3-carrera">
                    <Col className="text-center-carrera">
                        <Button color="primary" tag={Link} to="/carreras/new" className="create-button-carrera">
                            Crear Nueva Carrera
                        </Button>
                    </Col>
                </Row>

                <Row className="cuadros-informacion">
                    {carreras.map((carrera) => (
                        <Col sm="12" md="4" lg="4" key={carrera.id_carrera} className="mb-4-carrera">
                            <Card className="cuadro-carrera">
                                <CardBody className="body-carrera">
                                    <CardTitle tag="h5" className="text-center-carrera">
                                        {carrera.nombre_carrera}
                                    </CardTitle>
                                    <div className="boton-grupo-carrera">
                                        <Button color="warning" size="sm" tag={Link} to={`/carreras/edit/${carrera.id_carrera}`} >
                                            <PiPencilLineBold className="icon-carrera" /> Editar
                                        </Button>
                                        <Button color="danger" size="sm" onClick={() => handleDelete(carrera.id_carrera)} >
                                            <BsTrashFill className="icon-carrera" /> Eliminar
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