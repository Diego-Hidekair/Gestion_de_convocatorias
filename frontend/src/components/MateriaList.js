// src/components/MateriaList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const MateriaList = () => {
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
        <div className="container">
            <h2>Lista de Materias</h2>
            <Link to="/materias/crear" className="btn btn-primary mb-3">Crear Materia</Link>
            <table className="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Código</th>
                        <th>Nombre</th>
                        <th>Horas Teoría</th>
                        <th>Horas Práctica</th>
                        <th>Horas Laboratorio</th>
                        <th>Carrera</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {materias.map(materia => (
                        <tr key={materia.id_materia}>
                            <td>{materia.id_materia}</td>
                            <td>{materia.codigomateria}</td>
                            <td>{materia.nombre}</td>
                            <td>{materia.horas_teoria}</td>
                            <td>{materia.horas_practica}</td>
                            <td>{materia.horas_laboratorio}</td>
                            <td>{materia.id_carrera}</td>
                            <td>
                                <Link to={`/materias/editar/${materia.id_materia}`} className="btn btn-warning">Editar</Link>
                                <button onClick={() => handleDelete(materia.id_materia)} className="btn btn-danger">Eliminar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default MateriaList;
