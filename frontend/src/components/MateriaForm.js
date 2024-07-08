// src/components/MateriaForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MateriaForm = () => {
    const [codigomateria, setCodigoMateria] = useState('');
    const [nombre, setNombre] = useState('');
    const [id_carrera, setIdCarrera] = useState('');
    const [carreras, setCarreras] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchCarreras = async () => {
            try {
                const response = await axios.get('http://localhost:5000/carreras');
                setCarreras(response.data);
            } catch (error) {
                console.error('Error al obtener las carreras:', error);
            }
        };

        fetchCarreras();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/materias', {
                codigomateria,
                nombre,
                id_carrera
            });
            navigate('/materias');
        } catch (error) {
            console.error('Error al crear la materia:', error);
        }
    };

    return (
        <div className="container">
            <h2>Crear Materia</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Código de Materia:</label>
                    <input
                        type="text"
                        value={codigomateria}
                        onChange={(e) => setCodigoMateria(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Nombre:</label>
                    <input
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Carrera:</label>
                    <select
                        value={id_carrera}
                        onChange={(e) => setIdCarrera(e.target.value)}
                        required
                    >
                        <option value="">Seleccionar carrera</option>
                        {carreras.map((carrera) => (
                            <option key={carrera.id_carrera} value={carrera.id_carrera}>
                                {carrera.nombre_carrera}
                            </option>
                        ))}
                    </select>
                </div>
                <button type="submit">Crear</button>
            </form>
        </div>
    );
};

export default MateriaForm;
