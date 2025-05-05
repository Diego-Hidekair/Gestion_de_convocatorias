// frontend/src/components/ConvocatoriaRevisado.js 
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Button, Modal, ModalHeader, ModalBody, ModalFooter, Row, Col, Card, CardBody, CardTitle, CardText, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Alert } from 'reactstrap';
import { PiPencilLineBold } from "react-icons/pi";

const ConvocatoriaRevisado = () => {
    const [convocatorias, setConvocatorias] = useState([]);
    const [modal, setModal] = useState(false);
    const [selectedConvocatoria, setSelectedConvocatoria] = useState(null);
    const [newEstado, setNewEstado] = useState("");
    const [statusDropdowns, setStatusDropdowns] = useState({});
    const [message, setMessage] = useState({});
    
    const toggleStatusDropdown = (idConvocatoria) => {
        setStatusDropdowns((prevState) => ({
            ...prevState,
            [idConvocatoria]: !prevState[idConvocatoria]
        }));
    };

    useEffect(() => {
        const fetchConvocatorias = async () => {//e obtiene las convocatorias en estado observado
            try {
                const response = await axios.get('/convocatorias/estado/Revisado');
                setConvocatorias(response.data);
            } catch (error) {
                console.error('Error fetching convocatorias:', error);
            }
        };
        fetchConvocatorias();
    }, []);

    const handleEstadoChange = async (idConvocatoria, newEstado) => {
        try {
            await axios.patch(`/convocatorias/${idConvocatoria}/estado`, { estado: newEstado });
            setConvocatorias(convocatorias.map((c) =>
                c.id_convocatoria === idConvocatoria ? { ...c, estado: newEstado } : c
            ));
            setMessage({ [idConvocatoria]: `Estado actualizado a: ${newEstado}` });
            setTimeout(() => setMessage({}), 3000);
        } catch (error) {
            console.error('Error updating convocatoria estado:', error);
        }
    };

    return (
        <Container className="container-list-convocatoria mt-4">
            <Row className="mb-4">
                <Col>
                    <h1 className="text-center-convocatoria">Convocatorias Revisadas</h1>
                </Col>
            </Row>

            {convocatorias.length === 0 ? (
                <h5 className="text-center">No hay convocatorias revisadas.</h5>
            ) : (
                convocatorias.map((convocatoria) => (
                    <Card key={convocatoria.id_convocatoria} className="convocatoria-card mb-3">
                        <CardBody>
                            <CardTitle tag="h5" className="convocatoria-title">{convocatoria.nombre}</CardTitle>
                            <CardText className="convocatoria-details">
                                <strong>Fecha de Inicio:</strong> {new Date(convocatoria.fecha_inicio).toLocaleDateString()} |
                                <strong> Fecha de Fin:</strong> {new Date(convocatoria.fecha_fin).toLocaleDateString()} |
                                <strong> Carrera:</strong> {convocatoria.nombre_programa} |
                                <strong> Facultad:</strong> {convocatoria.nombre_facultad} |
                                <strong> Estado:</strong> {convocatoria.estado}
                            </CardText>
                            <Dropdown isOpen={statusDropdowns[convocatoria.id_convocatoria]} toggle={() => toggleStatusDropdown(convocatoria.id_convocatoria)}>
                                <DropdownToggle caret>
                                    {convocatoria.estado || 'Seleccionar estado'}
                                </DropdownToggle>
                                <DropdownMenu>
                                    <DropdownItem onClick={() => handleEstadoChange(convocatoria.id_convocatoria, 'Para Publicar')}>
                                        Para Publicar
                                    </DropdownItem>
                                    <DropdownItem onClick={() => handleEstadoChange(convocatoria.id_convocatoria, 'Publicado')}>
                                        Publicado
                                    </DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                            {message[convocatoria.id_convocatoria] && (
                                <Alert color="success" className="mt-3">
                                    {message[convocatoria.id_convocatoria]}
                                </Alert>
                            )}
                            <Button
                                color="primary"
                                onClick={() => setSelectedConvocatoria(convocatoria)}
                                className="mt-3"
                            >
                                <PiPencilLineBold /> Editar Estado
                            </Button>
                        </CardBody>
                    </Card>
                ))
            )}

            {/* Modal de edición */}
            <Modal isOpen={modal} toggle={() => setModal(!modal)}>
                <ModalHeader toggle={() => setModal(!modal)}>Actualizar Estado</ModalHeader>
                <ModalBody>
                    <label>Nuevo Estado:</label>
                    <select className="form-control" onChange={(e) => setNewEstado(e.target.value)} value={newEstado}>
                        <option value="">Seleccionar...</option>
                        <option value="Para Publicar">Para Publicar</option>
                        <option value="Publicado">Publicado</option>
                    </select>
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={() => { handleEstadoChange(selectedConvocatoria.id_convocatoria, newEstado); setModal(false); }}>
                        Guardar
                    </Button>
                    <Button color="secondary" onClick={() => setModal(false)}>
                        Cancelar
                    </Button>
                </ModalFooter>
            </Modal>
        </Container>
    );
};

export default ConvocatoriaRevisado;
