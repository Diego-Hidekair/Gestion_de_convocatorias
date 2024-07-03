// frontend/components/UsuarioList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UsuarioList = () => {
    const [usuarios, setUsuarios] = useState([]);

    useEffect(() => {
        const fetchUsuarios = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:5000/api/usuarios', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setUsuarios(response.data);
            } catch (error) {
                console.error('Error al obtener usuarios:', error);
            }
        };

        fetchUsuarios();
    }, []);

    const handleDelete = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/usuarios/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setUsuarios(usuarios.filter(usuario => usuario.id !== id));
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
        }
    };
    

    return (
        <div>
            <h2>Lista de Usuarios</h2>
            <ul>
                {usuarios.map(usuario => (
                    <li key={usuario.id}>
                        {usuario.Nombres} {usuario.Apellido_paterno} {usuario.Apellido_materno}
                        <button>Editar</button>
                        <button onClick={() => handleDelete(usuario.id)}>Eliminar</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default UsuarioList;