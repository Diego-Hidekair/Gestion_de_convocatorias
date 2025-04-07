// frontend/src/components/Register.js
import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Container, Typography, Box, MenuItem, Select, InputLabel, FormControl, Alert, Snackbar} from '@mui/material';

const Register = () => {
    const [formData, setFormData] = useState({
        id: '',
        nombres: '',
        apellido_paterno: '',
        apellido_materno: '',
        rol: 'personal_administrativo', // Rol por defecto consistente
        contraseña: '',
        celular: ''
    });

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
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
        <form className="container" onSubmit={handleSubmit}>
            <input type="text" name="id" placeholder="ID" value={formData.id} onChange={handleChange} required />
            <input type="text" name="Nombres" placeholder="Nombres" value={formData.Nombres} onChange={handleChange} required />
            <input type="text" name="Apellido_paterno" placeholder="Apellido Paterno" value={formData.Apellido_paterno} onChange={handleChange} required />
            <input type="text" name="Apellido_materno" placeholder="Apellido Materno" value={formData.Apellido_materno} onChange={handleChange} required />
            <input type="password" name="Contraseña" placeholder="Contraseña" value={formData.Contraseña} onChange={handleChange} required />
            <input type="text" name="Celular" placeholder="Celular" value={formData.Celular} onChange={handleChange} required />
            <select name="Rol" value={formData.Rol} onChange={handleChange} required>
                <option value="admin">Admin</option>
                <option value="personal_administrativo">Personal Administrativo</option>
                <option value="secretaria_de_decanatura">Secretaría de Decanatura</option>
                <option value="tecnico_vicerrectorado">Técnico de Vicerrectorado</option>
                <option value="vicerrectorado">Vicerrectorado</option>
            </select>
            <button type="submit">Registrar Usuario</button>
        </form>
    );
};

export default Register;
