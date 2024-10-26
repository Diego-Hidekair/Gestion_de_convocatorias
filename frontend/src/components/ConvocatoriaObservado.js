// frontend/src/components/ConvocatoriaObservado.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Card, CardBody, CardTitle, Button, Row, Col } from 'reactstrap';
import { BsTrashFill } from "react-icons/bs"; // Ícono de eliminar
import { PiPencilLineBold } from "react-icons/pi"; // Ícono de editar

const ConvocatoriaObservado = () => {
    const [convocatorias, setConvocatorias] = useState([]);

    useEffect(() => {
        const fetchConvocatorias = async () => {
            try {
                const response = await axios.get('/convocatorias/estado/observado');
                setConvocatorias(response.data);
            } catch (error) {
                console.error('Error fetching convocatorias:', error);
            }
        };

        fetchConvocatorias();
    }, []);

    const handleDelete = async (id) => {
        try {
            // Eliminar una convocatoria específica
            await axios.delete(`/convocatorias/${id}`);
            setConvocatorias(convocatorias.filter(convocatoria => convocatoria.id_convocatoria !== id));
        } catch (error) {
            console.error('Error deleting convocatoria:', error);
        }
    };

    return (
        <div className="degraded-background-convocatoria">
            <Container className="container-list-convocatoria">
                <Row className="mb-4-convocatoria">
                    <Col>
                        <h1 className="text-center-convocatoria">Convocatorias Observadas</h1>
                    </Col>
                </Row>

                <Row>
                    {convocatorias.length === 0 ? (
                        <Col>
                            <h5 className="text-center-convocatoria">No hay convocatorias observadas.</h5>
                        </Col>
                    ) : (
                        convocatorias.map((convocatoria) => (
                            <Col sm="12" md="4" lg="4" key={convocatoria.id_convocatoria} className="mb-4-convocatoria">
                                <Card className="card-custom-convocatoria">
                                    <CardBody className="d-flex-convocatoria flex-column-convocatoria justify-content-between-convocatoria">
                                        <CardTitle tag="h5" className="text-center-convocatoria">
                                            {convocatoria.nombre}
                                        </CardTitle>
                                        <div className="d-flex-convocatoria justify-content-between-convocatoria mt-3-convocatoria button-group-convocatoria">
                                            <Button
                                                color="warning"
                                                size="sm"
                                                //tag={Link}
                                                to={`/convocatorias/${convocatoria.id_convocatoria}/editar`}
                                                className="custom-button-convocatoria"
                                            >
                                                <PiPencilLineBold className="icon" /> Editar
                                            </Button>
                                            <Button
                                                color="danger"
                                                size="sm"
                                                onClick={() => handleDelete(convocatoria.id_convocatoria)}
                                                className="custom-button-convocatoria"
                                            >
                                                <BsTrashFill className="icon" /> Eliminar
                                            </Button>
                                        </div>
                                    </CardBody>
                                </Card>
                            </Col>
                        ))
                    )}
                </Row>
            </Container>
        </div>
    );
};

export default ConvocatoriaObservado;
