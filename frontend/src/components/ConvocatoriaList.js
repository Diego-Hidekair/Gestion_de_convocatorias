// frontend/src/components/ConvocatoriaList.js 
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Container, Button, Modal, ModalHeader, ModalBody, ModalFooter, Row, Col, Card, CardBody, CardTitle, CardText, Alert, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { BsTrashFill } from "react-icons/bs";
import { AiOutlineEye, AiOutlineDownload } from "react-icons/ai";
import '../styles/convocatoria.css';

const ConvocatoriaList = () => {
    const [convocatorias, setConvocatorias] = useState([]);
    const [searchBy, setSearchBy] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [previewUrl, setPreviewUrl] = useState('');
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false); // Estado para modal de vista previa
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // Estado para modal de confirmación de eliminación
    const [showAlert, setShowAlert] = useState(false);
    const [statusDropdowns, setStatusDropdowns] = useState({});
    const [message, setMessage] = useState({});
    const [idToDelete, setIdToDelete] = useState(null); 

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES');
    };

    const toggleStatusDropdown = (idConvocatoria) => {
        setStatusDropdowns((prevState) => ({
            ...prevState,
            [idConvocatoria]: !prevState[idConvocatoria]
        }));
    };
    
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

    const handleDelete = async () => {
        try {
            await axios.delete(`http://localhost:5000/convocatorias/${idToDelete}`);
            setConvocatorias(convocatorias.filter(convocatoria => convocatoria.id_convocatoria !== idToDelete));
            setIsDeleteModalOpen(false); // Cerrar el modal después de eliminar
        } catch (error) {
            console.error('Error deleting convocatoria:', error);
        }
    };

    const togglePreviewModal = () => {
        setIsPreviewModalOpen(!isPreviewModalOpen);
    };

    const toggleDeleteModal = () => {
        setIsDeleteModalOpen(!isDeleteModalOpen);
    };

    const handlePreview = (idConvocatoria) => {
        setPreviewUrl(`http://localhost:5000/pdf/combinado/${idConvocatoria}`);
        togglePreviewModal();
    };

    const handleDownload = async (idConvocatoria) => {
        try {
            setShowAlert(true);
            setTimeout(() => setShowAlert(false), 3000);
            const response = await axios.get(`http://localhost:5000/pdf/download/${idConvocatoria}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `documento_${idConvocatoria}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error descargando el documento:', error);
        }
    };

    const handleStatusChange = async (idConvocatoria, newStatus) => {
        try {
            await axios.patch(`http://localhost:5000/convocatorias/${idConvocatoria}/estado`, { estado: newStatus });
            const response = await axios.get('http://localhost:5000/convocatorias');
            setConvocatorias(response.data);
            setMessage((prevMessages) => ({
                ...prevMessages,
                [idConvocatoria]: `Estado actualizado a: ${newStatus}`
            }));
        } catch (error) {
            console.error('Error actualizando el estado de la convocatoria:', error);
        }
    };

    const sortedConvocatorias = convocatorias.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const filteredConvocatorias = sortedConvocatorias.filter(convocatoria => {
        if (!searchBy) return true;
        const value = convocatoria[searchBy]?.toString().toLowerCase();
        return value?.includes(searchTerm.toLowerCase());
    });

    return (
        <Container className="container-list-convocatoria mt-4">
            <Row className="mb-4">
                <Col>
                    <h1 className="text-center-convocatoria">Lista de Convocatorias</h1>
                </Col>
            </Row>
            <div className="mb-3 d-flex justify-content-between align-items-center">
                <Button className="custom-button-convocatoria" color="success" tag={Link} to="/convocatorias/crear">
                    Crear Nueva Convocatoria
                </Button>

                <div className="search-container-convocatoria">
                    <select className="form-select-convocatoria" value={searchBy} onChange={(e) => setSearchBy(e.target.value)}>
                        <option value="">Buscar por...</option>
                        <option value="nombre">Nombre</option>
                        <option value="fecha_inicio">Fecha de Inicio</option>
                        <option value="fecha_fin">Fecha de Fin</option>
                        <option value="nombre_tipoconvocatoria">Tipo de Convocatoria</option>
                        <option value="nombre_programa">Carrera</option>
                        <option value="nombre_facultad">Facultad</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Buscar..."
                        className="form-control-convocatoria"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {filteredConvocatorias.map((convocatoria) => (
                <Card key={convocatoria.id_convocatoria} className="convocatoria-card mb-3">
                    <CardBody>
                        <CardTitle tag="h5" className="convocatoria-title">{convocatoria.nombre}</CardTitle>
                        <CardText className="convocatoria-details">
                            <strong>Fecha de Inicio:</strong> {formatDate(convocatoria.fecha_inicio)} | 
                            <strong> Fecha de Fin:</strong> {formatDate(convocatoria.fecha_fin)} | 
                            <strong> Tipo:</strong> {convocatoria.nombre_tipoconvocatoria} | 
                            <strong> Carrera:</strong> {convocatoria.nombre_programa} | 
                            <strong> Facultad:</strong> {convocatoria.nombre_facultad} | 
                            <strong> Estado:</strong> {convocatoria.estado}
                        </CardText>

                        {/* Dropdown to select new estado */}
                        {convocatoria.estado !== 'Revisado' && (
                            <Dropdown isOpen={statusDropdowns[convocatoria.id_convocatoria]} toggle={() => toggleStatusDropdown(convocatoria.id_convocatoria)}>
                                <DropdownToggle caret>
                                    {convocatoria.estado || 'Seleccionar estado'}
                                </DropdownToggle>
                                <DropdownMenu>
                                    <DropdownItem onClick={() => { handleStatusChange(convocatoria.id_convocatoria, 'Para Revisión'); }} >
                                        Para Revisión
                                    </DropdownItem>
                                    <DropdownItem onClick={() => { handleStatusChange(convocatoria.id_convocatoria, 'En Revisión'); }} >
                                        En Revisión
                                    </DropdownItem>
                                    <DropdownItem onClick={() => { handleStatusChange(convocatoria.id_convocatoria, 'Observado'); }} >
                                        Observado
                                    </DropdownItem>
                                    <DropdownItem onClick={() => { handleStatusChange(convocatoria.id_convocatoria, 'Revisado'); }} >
                                        Revisado
                                    </DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        )}
                        {message[convocatoria.id_convocatoria] && (
                            <Alert color="success" className="mt-3">{message[convocatoria.id_convocatoria]}</Alert>
                        )}

                        <div className="d-flex justify-content-end">
                            <Button color="danger" onClick={() => { setIdToDelete(convocatoria.id_convocatoria); toggleDeleteModal(); }}>
                                <BsTrashFill /> Eliminar
                            </Button>
                            {convocatoria.id_convocatoria && convocatoria.documento_path && (
                                <>
                                    <Button color="warning" size="sm" onClick={() => handlePreview(convocatoria.id_convocatoria)} className="mx-2">
                                        <AiOutlineEye className="view-icon" /> Vista previa
                                    </Button>

                                    <Button color="success" size="sm" onClick={() => handleDownload(convocatoria.id_convocatoria)}>
                                        <AiOutlineDownload className="download-icon" /> Descargar
                                    </Button>
                                </>
                            )}
                        </div>
                    </CardBody>
                </Card>
            ))}

            {/* Modal de vista previa del PDF */}
            <Modal isOpen={isPreviewModalOpen} toggle={togglePreviewModal} size="lg">
                <ModalHeader className="eliminar-conv" toggle={togglePreviewModal}>Vista previa del documento</ModalHeader>
                <ModalBody>
                    <iframe src={previewUrl} title="Vista previa del PDF" style={{ width: '100%', height: '80vh' }} />
                </ModalBody>
            </Modal>

            {/* Modal de confirmación para eliminar */}
            <Modal isOpen={isDeleteModalOpen} toggle={toggleDeleteModal}>
                <ModalHeader className="eliminar-conv" toggle={toggleDeleteModal}>Confirmar eliminación</ModalHeader>
                <ModalBody className="eliminar-conv">¿Estás seguro de que deseas eliminar esta convocatoria?</ModalBody>
                <ModalFooter>
                    <Button color="danger" onClick={handleDelete}>Eliminar</Button>
                    <Button color="warning" onClick={toggleDeleteModal}>Cancelar</Button>
                </ModalFooter>
            </Modal>
        </Container>
    );
};

export default ConvocatoriaList;
