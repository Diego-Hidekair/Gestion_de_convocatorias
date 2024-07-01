// src/components/MateriaEdit.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const MateriaEdit = () => {
    const [nombre, setNombre] = useState('');
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMateria = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/materias/${id}`);
                setNombre(response.data.nombre);
            } catch (error) {
                console.error('Error al obtener la materia:', error);
            }
        };

        fetchMateria();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:5000/materias/${id}`, { nombre });
            navigate('/materias');
        } catch (error) {
            console.error('Error al actualizar la materia:', error);
        }
    };

    return (
        <div className="container">
            <h1>Editar Materia</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Nombre:
                    <input
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                    />
                </label>
                <button type="submit">Actualizar</button>
            </form>
        </div>
    );
};

export default MateriaEdit;
