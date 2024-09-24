// frontend/src/components/ConvocatoriaList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Container, Card, CardBody, CardTitle, Button, Row, Col } from 'reactstrap';
import { BsTrashFill } from "react-icons/bs"; // Ícono de eliminar
import { PiPencilLineBold } from "react-icons/pi"; // Ícono de editar
import '../Global.css';  // Importa el archivo CSS global

const ConvocatoriaList = () => {
    const [convocatorias, setConvocatorias] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchBy, setSearchBy] = useState('');

    useEffect(() => {
        const fetchConvocatorias = async () => {
            try {
                const response = await axios.get('http://localhost:5000/convocatorias');
                setConvocatorias(response.data);
            } catch (error) {
                console.error('Error fetching convocatorias:', error);
            }
        };
        fetchConvocatorias();
    }, []);

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/convocatorias/${id}`);
            setConvocatorias(convocatorias.filter(convocatoria => convocatoria.id_convocatoria !== id));
        } catch (error) {
            console.error('Error deleting convocatoria:', error);
        }
    };

    const filteredConvocatorias = convocatorias.filter(convocatoria => {
        if (!searchBy) return true;
        const value = convocatoria[searchBy]?.toString().toLowerCase();
        return value?.includes(searchTerm.toLowerCase());
    });

    return (
        <div className="degraded-background">
            <Container className="container-list">
                <Row className="mb-4">
                    <Col>
                        <h1 className="text-center">Lista de Convocatorias</h1>
                    </Col>
                </Row>
                <Row className="mb-3">
                    <Col className="text-center">
                        <Button color="primary" tag={Link} to="/convocatorias/crear">
                            Crear Nueva Convocatoria
                        </Button>
                    </Col>
                </Row>

                <div className="mb-3">
                    <select className="form-select" value={searchBy} onChange={(e) => setSearchBy(e.target.value)}>
                        <option value="">Buscar por...</option>
                        <option value="cod_convocatoria">Código</option>
                        <option value="nombre">Nombre</option>
                        <option value="fecha_inicio">Fecha de Inicio</option>
                        <option value="fecha_fin">Fecha de Fin</option>
                        <option value="nombre_tipoconvocatoria">Tipo de Convocatoria</option>
                        <option value="nombre_carrera">Carrera</option>
                        <option value="nombre_facultad">Facultad</option>
                    </select>
                </div>

                <Row>
                    {filteredConvocatorias.map((convocatoria) => (
                        <Col sm="12" md="4" lg="4" key={convocatoria.id_convocatoria} className="mb-4">
                            <Card className="card-custom">
                                <CardBody className="d-flex flex-column justify-content-between">
                                    <CardTitle tag="h5" className="text-center">
                                        {convocatoria.nombre}
                                    </CardTitle>
                                    <div className="d-flex justify-content-between mt-3 button-group">
                                        <Button color="warning" size="sm" tag={Link} to={`/convocatorias/${convocatoria.id_convocatoria}/editar`} className="custom-button">
                                            <PiPencilLineBold className="icon" /> Editar
                                        </Button>
                                        <Button color="danger" size="sm" onClick={() => handleDelete(convocatoria.id_convocatoria)} className="custom-button">
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

export default ConvocatoriaList;