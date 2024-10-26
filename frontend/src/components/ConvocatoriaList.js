// frontend/src/components/ConvocatoriaList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Container, Table, Button, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { BsTrashFill } from "react-icons/bs";
import { PiPencilLineBold } from "react-icons/pi";
import { AiOutlineEye, AiOutlineDownload } from "react-icons/ai";

const ConvocatoriaList = () => {
    const [convocatorias, setConvocatorias] = useState([]);
    const [searchBy, setSearchBy] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [previewUrl, setPreviewUrl] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES');
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

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/convocatorias/${id}`);
            setConvocatorias(convocatorias.filter(convocatoria => convocatoria.id_convocatoria !== id));
        } catch (error) {
            console.error('Error deleting convocatoria:', error);
        }
    };

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    const handlePreview = (documentPath) => {
        setPreviewUrl(`http://localhost:5000/${documentPath}`);
        toggleModal();
    };

    const filteredConvocatorias = convocatorias.filter(convocatoria => {
        if (!searchBy) return true;
        const value = convocatoria[searchBy]?.toString().toLowerCase();
        return value?.includes(searchTerm.toLowerCase());
    });

    return (
        <Container className="container-list-convocatoria">
            <h1 className="text-center-convocatoria mb-4-convocatoria">Lista de Convocatorias</h1>
            
            <div className="mb-3-convocatoria d-flex-convocatoria justify-content-between-convocatoria">
                <Button color="primary" tag={Link} to="/convocatorias/crear">
                    Crear Nueva Convocatoria
                </Button>
                
                <div>
                    <select className="form-select-convocatoria" value={searchBy} onChange={(e) => setSearchBy(e.target.value)}>
                        <option value="">Buscar por...</option>
                        <option value="nombre">Nombre</option>
                        <option value="fecha_inicio">Fecha de Inicio</option>
                        <option value="fecha_fin">Fecha de Fin</option>
                        <option value="nombre_tipoconvocatoria">Tipo de Convocatoria</option>
                        <option value="nombre_programa">Carrera</option> 
                        <option value="nombre_facultad">Facultad</option> {/* Nueva opción de búsqueda */}
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

            <Table striped bordered responsive>
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Fecha de Inicio</th>
                        <th>Fecha de Fin</th>
                        <th>Usuario</th>
                        <th>Tipo de Convocatoria</th>
                        <th>Carrera</th> 
                        <th>Facultad</th> {/* Nueva columna de facultad */}
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredConvocatorias.map((convocatoria) => (
                        <tr key={convocatoria.id_convocatoria}>
                            <td>{convocatoria.nombre}</td>
                            <td>{formatDate(convocatoria.fecha_inicio)}</td>
                            <td>{formatDate(convocatoria.fecha_fin)}</td>
                            <td>{convocatoria.id_usuario}</td>
                            <td>{convocatoria.nombre_tipoconvocatoria}</td>
                            <td>{convocatoria.nombre_programa}</td>
                            <td>{convocatoria.nombre_facultad}</td> {/* Mostrar facultad */}
                            <td>{convocatoria.estado}</td>
                            <td>
                                <div className="d-flex-convocatoria flex-column-convocatoria align-items-center-convocatoria">
                                    <Button color="warning" size="sm" tag={Link} to={`/convocatorias/${convocatoria.id_convocatoria}/editar`} className="custom-button-convocatoria mb-1-convocatoria">
                                        <PiPencilLineBold className="icon" /> Editar
                                    </Button>
                                    <Button color="danger" size="sm" onClick={() => handleDelete(convocatoria.id_convocatoria)} className="custom-button-convocatoria mb-1-convocatoria">
                                        <BsTrashFill className="icon" /> Eliminar
                                    </Button>
                                    {convocatoria.documento_path && (
                                        <>
                                            <Button color="info" size="sm" onClick={() => handlePreview(convocatoria.documento_path)} className="custom-button-convocatoria mb-1-convocatoria">
                                                <AiOutlineEye className="icon" /> Vista Previa
                                            </Button>
                                            <Button color="secondary" size="sm" href={`http://localhost:5000/${convocatoria.documento_path}`} download className="custom-button-convocatoria">
                                                <AiOutlineDownload className="icon" /> Descargar
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <Modal isOpen={isModalOpen} toggle={toggleModal} size="lg">
                <ModalHeader toggle={toggleModal}>Vista Previa del PDF</ModalHeader>
                <ModalBody>
                    {previewUrl && (
                        <iframe
                            src={previewUrl}
                            title="Vista Previa PDF"
                            style={{ width: '100%', height: '500px' }}
                        ></iframe>
                    )}
                </ModalBody>
            </Modal>
        </Container>
    );
};

export default ConvocatoriaList;
