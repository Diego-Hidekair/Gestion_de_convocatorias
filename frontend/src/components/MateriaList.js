// src/components/MateriaList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Container, Table, Button } from 'reactstrap';
import { BsTrashFill } from "react-icons/bs";
import { PiPencilLineBold } from "react-icons/pi";
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

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/materias/${id}`);
            setMaterias(materias.filter((materia) => materia.id_materia !== id));
        } catch (error) {
            console.error('Error al eliminar la materia:', error);
        }
    };

    return (
        <div className={`materia-list-container ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
            <Container className="container-list">
                <h2 className="text-center">Lista de Materias</h2>
                <Link to="/materias/crear" className="btn btn-primary mb-3 create-button">Crear Materia</Link>
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
                            <th>Acciones</th>
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
                                <td>{materia.id_carrera}</td>
                                <td>
                                    <Link to={`/materias/editar/${materia.id_materia}`} className="btn btn-warning btn-sm custom-button">
                                        <PiPencilLineBold className="icon" /> Editar
                                    </Link>
                                    <Button onClick={() => handleDelete(materia.id_materia)} color="danger" size="sm" className="custom-button">
                                        <BsTrashFill className="icon" /> Eliminar
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Container>
        </div>
    );
};

export default MateriaList;
