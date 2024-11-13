// frontend/src/components/ConvocatoriaList_secretaria.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Container, Button, Row, Col, Card, CardBody, CardTitle, CardText} from 'reactstrap';

import { AiOutlineEye } from "react-icons/ai";
import '../styles/convocatoria.css';

const ConvocatoriaListSecretaria = () => {
    const [convocatorias, setConvocatorias] = useState([]);
    const [setPreviewUrl] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchConvocatoriasSecretaria = async () => {
        try {
            const response = await axios.get('http://localhost:5000/convocatorias/facultad');
            setConvocatorias(response.data);
        } catch (error) {
            console.error('Error al obtener convocatorias:', error);
        }
    }; 

    useEffect(() => {
        fetchConvocatoriasSecretaria();
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES');
    };

    const handlePreview = (idConvocatoria) => {
        setPreviewUrl(`http://localhost:5000/pdf/combinado/${idConvocatoria}`);
        setIsModalOpen(!isModalOpen);
    };

    return (
        <Container className="container-list-convocatoria mt-4">
            <Row className="mb-4">
                <Col>
                    <h1 className="text-center-convocatoria">Convocatorias de Mi Facultad</h1>
                </Col>
            </Row>
            {convocatorias.map((convocatoria) => (
                <Card key={convocatoria.id_convocatoria} className="convocatoria-card mb-3">
                    <CardBody>
                        <CardTitle tag="h5" className="convocatoria-title">{convocatoria.nombre}</CardTitle>
                        <CardText className="convocatoria-details">
                            <strong>Fecha de Inicio:</strong> {formatDate(convocatoria.fecha_inicio)} | 
                            <strong> Fecha de Fin:</strong> {formatDate(convocatoria.fecha_fin)} | 
                            <strong> Tipo:</strong> {convocatoria.nombre_tipoconvocatoria} | 
                            <strong> Carrera:</strong> {convocatoria.nombre_programa}
                        </CardText>
                        <div className="d-flex justify-content-end">
                            <Button color="warning" size="sm" onClick={() => handlePreview(convocatoria.id_convocatoria)} className="mx-2">
                                <AiOutlineEye /> Vista previa
                            </Button>
                            <Button color="success" size="sm" tag={Link} to={`/convocatorias/${convocatoria.id_convocatoria}`}>
                                Ver detalles
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            ))}
        </Container>
    );
};

export default ConvocatoriaListSecretaria;
