// frontend/src/components/CreateUser.js
import React, { useState } from 'react';
import api from '../config/axiosConfig';

const CreateUser = () => {
    const [userData, setUserData] = useState({
        id: '',
        Nombres: '',
        Apellido_paterno: '',
        Apellido_materno: '',
        Rol: 'secretaria_de_decanatura',
        Contrasena: '',
        Celular: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData({ ...userData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/usuarios', userData);
            console.log('Usuario creado:', response.data);
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
                <input type="password" name="Contrasena" placeholder="Contrasena" value={userData.Contrasena} onChange={handleChange} required />
                <input type="text" name="Celular" placeholder="Celular" value={userData.Celular} onChange={handleChange} required />
                <button type="submit">Crear Usuario</button>
            </form>
        </div>
    );
};

export default CreateUser;