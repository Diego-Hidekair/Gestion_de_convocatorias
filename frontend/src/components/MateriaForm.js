// src/components/MateriaForm.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MateriaForm = () => {
    const [nombre, setNombre] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/materias', { nombre });
            navigate('/materias');
        } catch (error) {
            console.error('Error al crear la materia:', error);
        }
    };

    return (
        <div>
            <h1>Crear Nueva Materia</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Nombre:
                    <input
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                    />
                </label>
                <button type="submit">Crear</button>
            </form>
        </div>
    );
};

export default MateriaForm;
