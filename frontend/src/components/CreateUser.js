// frontend/src/components/CreateUser.js
import React, { useState } from 'react';
import axios from 'axios';

const CreateUser = () => {
    const [userData, setUserData] = useState({
        id: '',
        Nombres: '',
        Apellido_paterno: '',
        Apellido_materno: '',
        Rol: 'secretaria_de_decanatura', 
        Contraseña: '',
        Celular: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData({ ...userData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/usuarios', userData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            console.log('Usuario creado:', response.data);
            // Redirigir o limpiar el formulario después de la creación
        } catch (error) {
            console.error('Error al crear usuario:', error);
        }
    };

    return (
        <div className="container">
            <h2>Crear Usuario</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" name="id" placeholder="ID" value={userData.id} onChange={handleChange} required />
                <input type="text" name="Nombres" placeholder="Nombres" value={userData.Nombres} onChange={handleChange} required />
                <input type="text" name="Apellido_paterno" placeholder="Apellido Paterno" value={userData.Apellido_paterno} onChange={handleChange} required />
                <input type="text" name="Apellido_materno" placeholder="Apellido Materno" value={userData.Apellido_materno} onChange={handleChange} required />
                <select name="Rol" value={userData.Rol} onChange={handleChange} required>
                    <option value="admin">Admin</option>
                    <option value="personal_administrativo">Personal Administrativo</option>
                    <option value="secretaria_de_decanatura">Secretaría de Decanatura</option>
                    <option value="tecnico_vicerrectorado">Técnico de Vicerrectorado</option>
                    <option value="vicerrectorado">Vicerrectorado</option>
                </select>
                <input type="password" name="Contraseña" placeholder="Contraseña" value={userData.Contraseña} onChange={handleChange} required />
                <input type="text" name="Celular" placeholder="Celular" value={userData.Celular} onChange={handleChange} required />
                <button type="submit">Crear Usuario</button>
            </form>
        </div>
    );
};

export default CreateUser;
