import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UsuarioList = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUsuarios = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                };
                const response = await axios.get('http://localhost:5000/api/usuarios', config);
                setUsuarios(response.data);
            } catch (err) {
                console.error('Error fetching usuarios:', err);
                setError('Error fetching usuarios');
            }
        };
        fetchUsuarios();
    }, []);

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="container">
            <h2>Lista de Usuarios</h2>
            <ul>
                {usuarios.map(usuario => (
                    <li key={usuario.id}>{usuario.Nombres} {usuario.Apellido_paterno}</li>
                ))}
            </ul>
        </div>
    );
};

export default UsuarioList;
