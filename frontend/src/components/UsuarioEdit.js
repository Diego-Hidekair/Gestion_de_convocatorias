// frontend/src/components/UsuarioEdit.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const UsuarioEdit = () => {
    const { id } = useParams();
    const [user, setUser] = useState({
        id: '',
        Nombres: '',
        Apellido_paterno: '',
        Apellido_materno: '',
        Rol: '',
        Contraseña: '',
        Celular: ''
    });

    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`http://localhost:5000/api/usuarios/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUser(response.data);
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        };

        fetchUser();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser({ ...user, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/usuarios/${id}`, user, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigate('/usuarios');
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    return (
        <div className="container">
            <h2>Editar Usuario</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" name="id" placeholder="ID" value={user.id} onChange={handleChange} required />
                <input type="text" name="Nombres" placeholder="Nombres" value={user.Nombres} onChange={handleChange} required />
                <input type="text" name="Apellido_paterno" placeholder="Apellido Paterno" value={user.Apellido_paterno} onChange={handleChange} required />
                <input type="text" name="Apellido_materno" placeholder="Apellido Materno" value={user.Apellido_materno} onChange={handleChange} required />
                <input type="text" name="Rol" placeholder="Rol" value={user.Rol} onChange={handleChange} required />
                <input type="password" name="Contraseña" placeholder="Contraseña" value={user.Contraseña} onChange={handleChange} required />
                <input type="text" name="Celular" placeholder="Celular" value={user.Celular} onChange={handleChange} required />
                <button type="submit">Actualizar</button>
            </form>
        </div>
    );
};

export default UsuarioEdit;
