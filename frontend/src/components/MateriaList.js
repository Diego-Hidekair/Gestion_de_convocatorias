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
            <Link to="/materias/new">Crear Nueva Materia</Link>
            <ul>
                {materias.map((materia) => (
                    <li key={materia.id_materia}>
                        {materia.codigomateria} - {materia.nombre} - Carrera ID: {materia.id_carrera}
                        <Link to={`/materias/edit/${materia.id_materia}`}>Editar</Link>
                        <button onClick={() => handleDelete(materia.id_materia)}>Eliminar</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MateriaList;
