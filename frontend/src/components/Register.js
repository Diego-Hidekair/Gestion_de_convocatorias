// frontend/src/components/Register.js
import React, { useState } from 'react';
import axios from 'axios';

const Register = () => {
    const [formData, setFormData] = useState({
        id: '',
        Nombres: '',
        Apellido_paterno: '',
        Apellido_materno: '',
        Rol: 'admin', // Asignar rol por defecto
        Contraseña: '',
        Celular: ''
    });

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
            await axios.post('http://localhost:5000/api/usuarios/register', formData);
            alert('Usuario creado exitosamente');
            setFormData({
                id: '',
                Nombres: '',
                Apellido_paterno: '',
                Apellido_materno: '',
                Rol: 'admin',
                Contraseña: '',
                Celular: ''
            });
        } catch (error) {
            console.error('Error al crear usuario:', error);
            alert('Error al crear usuario. Por favor, inténtelo de nuevo.');
        }
    };

    return (
        <form  className="container" nSubmit={handleSubmit}>
            <input type="text" name="id" placeholder="ID" value={formData.id} onChange={handleChange} required />
            <input type="text" name="Nombres" placeholder="Nombres" value={formData.Nombres} onChange={handleChange} required />
            <input type="text" name="Apellido_paterno" placeholder="Apellido Paterno" value={formData.Apellido_paterno} onChange={handleChange} required />
            <input type="text" name="Apellido_materno" placeholder="Apellido Materno" value={formData.Apellido_materno} onChange={handleChange} required />
            <input type="password" name="Contraseña" placeholder="Contraseña" value={formData.Contraseña} onChange={handleChange} required />
            <input type="text" name="Celular" placeholder="Celular" value={formData.Celular} onChange={handleChange} required />
            <button type="submit">Registrar Usuario</button>
        </form>
    );
};

export default Register;
