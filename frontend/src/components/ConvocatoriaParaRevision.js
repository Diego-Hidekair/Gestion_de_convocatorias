// frontend/src/components/ConvocatoriaParaRevision.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Card, CardBody, CardTitle, Button, Row, Col } from 'reactstrap';
import { BsTrashFill } from "react-icons/bs"; // Ícono de eliminar
import { PiPencilLineBold } from "react-icons/pi"; // Ícono de editar
import '../Global.css'; // Importa el archivo CSS global

const ConvocatoriaParaRevision = () => {
    const [convocatorias, setConvocatorias] = useState([]);

    useEffect(() => {
        const fetchConvocatorias = async () => {
            try {
                // Asegúrate de que esta ruta sea la correcta
                const response = await axios.get('/convocatorias/estado/para-revision');
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
        <div className="degraded-background">
            <Container className="container-list">
                <Row className="mb-4">
                    <Col>
                        <h1 className="text-center">Convocatorias Para Revisión</h1>
                    </Col>
                </Row>

                <Row>
                    {convocatorias.length === 0 ? (
                        <Col>
                            <h5 className="text-center">No hay convocatorias para revisión.</h5>
                        </Col>
                    ) : (
                        convocatorias.map((convocatoria) => (
                            <Col sm="12" md="4" lg="4" key={convocatoria.id_convocatoria} className="mb-4">
                                <Card className="card-custom">
                                    <CardBody className="d-flex flex-column justify-content-between">
                                        <CardTitle tag="h5" className="text-center">
                                            {convocatoria.nombre}
                                        </CardTitle>
                                        <div className="d-flex justify-content-between mt-3 button-group">
                                            <Button
                                                color="warning"
                                                size="sm"
                                                //tag={Link}
                                                to={`/convocatorias/${convocatoria.id_convocatoria}/editar`}
                                                className="custom-button"
                                            >
                                                <PiPencilLineBold className="icon" /> Editar
                                            </Button>
                                            <Button
                                                color="danger"
                                                size="sm"
                                                onClick={() => handleDelete(convocatoria.id_convocatoria)}
                                                className="custom-button"
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

export default ConvocatoriaParaRevision;