// src/components/MateriaList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Table } from 'reactstrap';
import '../styles/materias.css';

const MateriaList = ({ isOpen }) => {
    const [materias, setMaterias] = useState([]);

    useEffect(() => {
        const fetchMaterias = async () => {
            try {
                const response = await axios.get('http://localhost:5000/materias');
                setMaterias(response.data);
            } catch (error) {
                console.error('Error al obtener las materias:', error);
            }
        };

        fetchMaterias();
    }, []);

    return (
        <div className={`materia-list-container ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
            <Container className="container-list-materias">
                <h2 className="text-center-materia">Lista de Materias</h2>
                <Table dark hover striped>
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Nombre</th>
                            <th>Horas Teoría</th>
                            <th>Horas Práctica</th>
                            <th>Horas Laboratorio</th>
                            <th>Total Horas</th>
                            <th>Carrera</th>
                        </tr>
                    </thead>
                    <tbody>
                        {materias.map((materia) => (
                            <tr key={materia.id_materia}>
                                <td>{materia.codigomateria}</td>
                                <td>{materia.nombre}</td>
                                <td>{materia.horas_teoria}</td>
                                <td>{materia.horas_practica}</td>
                                <td>{materia.horas_laboratorio}</td>
                                <td>{materia.total_horas}</td>
                                <td>{materia.id_programa}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Container>
        </div>
    );
};

export default MateriaList;
