// src/components/MateriaList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/materias.css';

const MateriaList = ({ isOpen }) => {
    const [materias, setMaterias] = useState([]);
    // eslint-disable-next-line no-unused-vars
    const [carreras, setCarreras] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const materiasResponse = await axios.get('http://localhost:5000/materias');
                const carrerasResponse = await axios.get('http://localhost:5000/carreras');

                const materiasWithCarreras = materiasResponse.data.map((materia) => {
                    const carrera = carrerasResponse.data.find(
                        (c) => c.id_programa === materia.id_programa
                    );
                    return {
                        ...materia,
                        nombre_carrera: carrera ? carrera.nombre_carrera : 'Desconocido'
                    };
                });

                setMaterias(materiasWithCarreras);
                setCarreras(carrerasResponse.data);
            } catch (error) {
                console.error('Error al obtener las materias y carreras:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <div className={`materia-list-container ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
            <h2 className="text-center-materia">Lista de Materias</h2>
            <table className="custom-table">
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
                        <tr key={materia.codigomateria}>
                            <td>{materia.codigomateria}</td>
                            <td>{materia.nombre}</td>
                            <td>{materia.horas_teoria}</td>
                            <td>{materia.horas_practica}</td>
                            <td>{materia.horas_laboratorio}</td>
                            <td>{materia.total_horas}</td>
                            <td>{materia.nombre_carrera}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default MateriaList;
