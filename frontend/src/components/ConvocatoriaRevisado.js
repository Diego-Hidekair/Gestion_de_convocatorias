// frontend/src/components/ConvocatoriaRevisado.js 
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Card, CardBody, CardTitle, Button, Row, Col, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input } from 'reactstrap'; 
import { PiPencilLineBold } from "react-icons/pi";

const ConvocatoriaRevisado = () => { 
    const [convocatorias, setConvocatorias] = useState([]); 
    const [selectedConvocatoria, setSelectedConvocatoria] = useState(null); 
    const [newEstado, setNewEstado] = useState(""); 
    const [modal, setModal] = useState(false);

    useEffect(() => {
        const fetchConvocatorias = async () => {
            try {
                const response = await axios.get('/convocatorias/estado/Revisado');
                setConvocatorias(response.data);
            } catch (error) {
                console.error('Error fetching convocatorias:', error);
            }
        };
        fetchConvocatorias();
    }, []);

    const toggleModal = () => setModal(!modal);

    const handleEditClick = (convocatoria) => {
        setSelectedConvocatoria(convocatoria);
        setModal(true);
    };

    const handleEstadoChange = async () => {
        try {
            await axios.patch(`/convocatorias/${selectedConvocatoria.id_convocatoria}/estado`, { estado: newEstado });
            setConvocatorias(convocatorias.map(c => 
                c.id_convocatoria === selectedConvocatoria.id_convocatoria 
                    ? { ...c, estado: newEstado } 
                    : c
            ));
            setModal(false);
        } catch (error) {
            console.error('Error updating convocatoria estado:', error);
        }
    };

    return (
        <div className="degraded-background-convocatoria-conv-estado">
            <Container className="container-list-convocatoria-conv-estado">
                <Row className="mb-4-convocatoria-conv-estado">
                    <Col>
                        <h1 className="text-center-convocatoria-conv-estado">Convocatorias Revisadas</h1>
                    </Col>
                </Row>

                <Row>
                    {convocatorias.length === 0 ? (
                        <Col>
                            <h5 className="text-center-convocatoria-conv-estado">No hay convocatorias revisadas.</h5>
                        </Col>
                    ) : (
                        convocatorias.map((convocatoria) => (
                            <Col sm="12" md="4" lg="4" key={convocatoria.id_convocatoria} className="mb-4-convocatoria-conv-estado">
                                <Card className="card-custom-convocatoria-conv-estado">
                                    <CardBody className="d-flex-conv-estado flex-column-conv-estado justify-content-between-conv-estado">
                                        <CardTitle tag="h5" className="text-center-convocatoria-conv-estado">
                                            {convocatoria.nombre}
                                        </CardTitle>
                                        <div className="d-flex-conv-estado justify-content-between-conv-estado mt-3-conv-estado button-group-convocatoria-conv-estado">
                                            <Button
                                                color="warning"
                                                size="sm"
                                                onClick={() => handleEditClick(convocatoria)}
                                                className="custom-button-convocatoria-conv-estado"
                                            >
                                                <PiPencilLineBold className="icon-conv-estado" /> Editar Estado
                                            </Button>
                                        </div>
                                    </CardBody>
                                </Card>
                            </Col>
                        ))
                    )}
                </Row>

                <Modal isOpen={modal} toggle={toggleModal}>
                    <ModalHeader toggle={toggleModal}>Cambiar Estado de la Convocatoria</ModalHeader>
                    <ModalBody>
                        <Form>
                            <FormGroup>
                                <Label for="estado">Selecciona el nuevo estado</Label>
                                <Input 
                                    type="select" 
                                    name="estado" 
                                    id="estado" 
                                    onChange={(e) => setNewEstado(e.target.value)}
                                >
                                    <option value="">Selecciona el estado</option>
                                    <option value="Para Revisión">Para Revisión</option>
                                    <option value="En Revisión">En Revisión</option>
                                    <option value="Observado">Observado</option>
                                    <option value="Revisado">Revisado</option>
                                </Input>
                            </FormGroup>
                        </Form>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={handleEstadoChange}>Guardar</Button>
                        <Button color="secondary" onClick={toggleModal}>Cancelar</Button>
                    </ModalFooter>
                </Modal>
            </Container>
        </div>
    );
};

export default ConvocatoriaRevisado;
