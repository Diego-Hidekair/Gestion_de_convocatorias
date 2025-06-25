import React, { useState, useEffect } from 'react';
import api from '../config/axiosConfig';
import { Container, Button, Table, FormGroup, Input } from 'reactstrap';
import ConvocatoriaNav from './ConvocatoriaNav';

const ConvocatoriaEstadoFacultad = () => {
    const [estadoSeleccionado, setEstadoSeleccionado] = useState('Para Revisión');
    const [convocatorias, setConvocatorias] = useState([]);

    useEffect(() => {
        const fetchConvocatorias = async () => {
            try {
                const response = await api.get(`/convocatorias/estado/facultad/${estadoSeleccionado}`);
                setConvocatorias(response.data);
            } catch (error) {
                console.error('Error fetching convocatorias:', error);
            }
        };

        fetchConvocatorias();
    }, [estadoSeleccionado]);

    return (
        <Container>
            <h1>Convocatorias por Estado y Facultad</h1>
            {/* Menú de navegación */}
            <ConvocatoriaNav />
            <FormGroup>
                <Input 
                    type="select" 
                    value={estadoSeleccionado} 
                    onChange={(e) => setEstadoSeleccionado(e.target.value)}
                >
                    <option value="Para Revisión">Para Revisión</option>
                    <option value="En Revisión">En Revisión</option>
                    <option value="Observado">Observado</option>
                    <option value="Revisado">Revisado</option>
                </Input>
            </FormGroup>

            {convocatorias.length === 0 ? (
                <p>No hay convocatorias para el estado seleccionado.</p>
            ) : (
                <Table bordered>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Fecha Inicio</th>
                            <th>Fecha Fin</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {convocatorias.map((convocatoria) => (
                            <tr key={convocatoria.id_convocatoria}>
                                <td>{convocatoria.nombre}</td>
                                <td>{convocatoria.fecha_inicio}</td>
                                <td>{convocatoria.fecha_fin}</td>
                                <td>{convocatoria.estado}</td>
                                <td>
                                    <Button color="warning" size="sm">
                                        Editar Estado
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
        </Container>
    );
};

export default ConvocatoriaEstadoFacultad;
