// src/components/MateriaForm.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';

const MateriaForm = () => {
    const [formData, setFormData] = useState({
        codigomateria: '',
        nombre: ''
    });
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        const fetchMateria = async () => {
            if (id) {
                try {
                    const response = await axios.get(`http://localhost:5000/materias/${id}`);
                    setFormData(response.data);
                } catch (error) {
                    console.error('Error al obtener la materia:', error);
                }
            }
        };
        fetchMateria();
    }, [id]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (id) {
                await axios.put(`http://localhost:5000/materias/${id}`, formData);
            } else {
                await axios.post('http://localhost:5000/materias', formData);
            }
            navigate('/materias');
        } catch (error) {
            console.error('Error al guardar la materia:', error);
        }
    };

    return (
        <div className="container">
            <h1>{id ? 'Editar Materia' : 'Crear Nueva Materia'}</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Código de Materia:
                    <input
                        type="text"
                        name="codigomateria"
                        value={formData.codigomateria}
                        onChange={handleChange}
                    />
                </label>
                <label>
                    Nombre:
                    <input
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        required
                    />
                </label>
                <button type="submit">{id ? 'Actualizar' : 'Crear'}</button>
            </form>
        </div>
    );
};

export default MateriaForm;
