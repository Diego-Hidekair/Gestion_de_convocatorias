// frontend/src/components/ConvocatoriaObservado.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Card, CardBody, CardTitle, Button, Row, Col, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input } from 'reactstrap';

const ConvocatoriaObservado = () => {
    const [convocatorias, setConvocatorias] = useState([]);
    const [selectedConvocatoria, setSelectedConvocatoria] = useState(null);
    const [newEstado, setNewEstado] = useState("");
    const [modal, setModal] = useState(false);

    useEffect(() => {
        const fetchConvocatorias = async () => {
            try {
                const response = await axios.get('/convocatorias/estado/Observado'); // Obtener convocatorias en estado "Observado"
                setConvocatorias(response.data);
            } catch (error) {
                console.error('Error fetching convocatorias:', error);
            }
        };

        fetchConvocatorias();
    }, []);

    const toggleModal = () => setModal(!modal);

    const handleEditClick = (convocatoria) => {
        setSelectedConvocatoria(convocatoria); // Guardar la convocatoria seleccionada
        setModal(true); // Abrir el modal
    };

    const handleEstadoChange = async () => {
        try {
            // Actualizar el estado de la convocatoria seleccionada
            await axios.patch(`/convocatorias/${selectedConvocatoria.id_convocatoria}/estado`, { estado: newEstado });
            // Actualizar la lista de convocatorias en el frontend
            setConvocatorias(convocatorias.map(c =>
                c.id_convocatoria === selectedConvocatoria.id_convocatoria
                    ? { ...c, estado: newEstado }
                    : c
            ));
            setModal(false); // Cerrar el modal
        } catch (error) {
            console.error('Error updating convocatoria estado:', error);
        }
    };

    return (
        <Container className="mt-4">
            <Row className="mb-4">
                <Col>
                    <h1 className="text-center">Convocatorias Observadas</h1>
                </Col>
            </Row>
            <Row>
                {convocatorias.length === 0 ? (
                    <Col>
                        <h5 className="text-center">No hay convocatorias observadas.</h5>
                    </Col>
                ) : (
                    convocatorias.map((convocatoria) => (
                        <Col sm="12" md="6" lg="4" key={convocatoria.id_convocatoria} className="mb-4">
                            <Card>
                                <CardBody>
                                    <CardTitle tag="h5" className="text-center">
                                        {convocatoria.nombre}
                                    </CardTitle>
                                    <p>
                                        <strong>Estado:</strong> {convocatoria.estado}
                                    </p>
                                    <div className="d-flex justify-content-between">
                                        <Button
                                            color="primary"
                                            onClick={() => handleEditClick(convocatoria)}
                                        >
                                            Editar Estado
                                        </Button>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                    ))
                )}
            </Row>

            {/* Modal para editar el estado */}
            {selectedConvocatoria && (
                <Modal isOpen={modal} toggle={toggleModal}>
                    <ModalHeader toggle={toggleModal}>Editar Estado</ModalHeader>
                    <ModalBody>
                        <Form>
                            <FormGroup>
                                <Label for="newEstado">Nuevo Estado</Label>
                                <Input
                                    type="select"
                                    id="newEstado"
                                    value={newEstado}
                                    onChange={(e) => setNewEstado(e.target.value)}
                                >
                                    <option value="">Seleccionar estado</option>
                                    <option value="Para Revisión">Para Revisión</option>
                                    <option value="En Revisión">En Revisión</option>
                                    <option value="Observado">Observado</option>
                                    <option value="Revisado">Revisado</option>
                                </Input>
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
            )}
        </Container>
    );
};

export default ConvocatoriaObservado;