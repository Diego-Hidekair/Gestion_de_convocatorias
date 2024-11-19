// frontend/src/components/ConvocatoriaParaRevision.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Card, CardBody, CardTitle, CardText, Button, Row, Col, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input } from 'reactstrap';
import '../styles/convocatoria.css';
import { PiPencilLineBold } from "react-icons/pi";

const ConvocatoriaParaRevision = () => {
    const [convocatorias, setConvocatorias] = useState([]);
    const [selectedConvocatoria, setSelectedConvocatoria] = useState(null);
    const [newEstado, setNewEstado] = useState(""); 
    const [modal, setModal] = useState(false);

    useEffect(() => {
        const fetchConvocatorias = async () => {
            try {
                const response = await axios.get('/convocatorias/estado/Para Revisión');
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

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES');
    };

    return (
        <div className="degraded-background-conv-estado">
            <Container className="container-list-conv-estado mt-4">
                <Row className="mb-4">
                    <Col>
                        <h1 className="text-center-conv-estado">Convocatorias Para Revisión</h1>
                    </Col>
                </Row>

                {convocatorias.length === 0 ? (
                    <Row>
                        <Col>
                            <h5 className="text-center-conv-estado">No hay convocatorias para revisión.</h5>
                        </Col>
                    </Row>
                ) : (
                    convocatorias.map((convocatoria) => (
                        <Card key={convocatoria.id_convocatoria} className="convocatoria-card mb-3">
                            <CardBody className="fondo-conv-div">
                                <CardTitle tag="h5" className="convocatoria-title">{convocatoria.nombre}</CardTitle>
                                <CardText className="convocatoria-details">
                                    <strong>Fecha de Inicio:</strong> {formatDate(convocatoria.fecha_inicio)} | 
                                    <strong> Fecha de Fin:</strong> {formatDate(convocatoria.fecha_fin)} | 
                                    <strong> Tipo:</strong> {convocatoria.nombre_tipoconvocatoria} | 
                                    <strong> Carrera:</strong> {convocatoria.nombre_programa} | 
                                    <strong> Facultad:</strong> {convocatoria.nombre_facultad} | 
                                    <strong> Estado:</strong> {convocatoria.estado}
                                </CardText>

                                <div className="d-flex justify-content-end">
                                    <Button color="warning" onClick={() => handleEditClick(convocatoria)}>
                                        <PiPencilLineBold /> Editar
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>
                    ))
                )}
                <Modal isOpen={modal} toggle={toggleModal}>
                    <ModalHeader toggle={toggleModal}>Editar Estado</ModalHeader>
                    <ModalBody>
                        <Form>
                            <FormGroup>
                                <Label for="estado">Nuevo Estado</Label>
                                <Input
                                    type="text"
                                    id="estado"
                                    value={newEstado}
                                    onChange={(e) => setNewEstado(e.target.value)}
                                    placeholder="Ingrese el nuevo estado"
                                />
                            </FormGroup>
                        </Form>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={handleEstadoChange}>
                            Guardar Cambios
                        </Button>
                        <Button color="secondary" onClick={toggleModal}>
                            Cancelar
                        </Button>
                    </ModalFooter>
                </Modal>
            </Container>
        </div>
    );
};

export default ConvocatoriaParaRevision;
