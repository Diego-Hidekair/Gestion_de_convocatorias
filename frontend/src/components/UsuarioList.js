// frontend/components/UsuarioList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UsuarioList = () => {
    const [usuarios, setUsuarios] = useState([]);

    useEffect(() => {
        const fetchUsuarios = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/usuarios'); // Ajusta la URL si es necesario
                setUsuarios(response.data);
            } catch (error) {
                console.error('Error al obtener usuarios:', error);
            }
        };

        fetchUsuarios();

    }, []);

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/usuarios/${id}`);
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
            <div>
                <button>Crear Usuario</button>
            </div>
        </div>
    );
};

export default UsuarioList;
