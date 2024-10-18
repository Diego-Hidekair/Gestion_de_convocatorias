// frontend/src/components/UsuarioPerfil.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UsuarioPerfil = () => {
    const [usuario, setUsuario] = useState(null);
    const [error, setError] = useState(null);

    // frontend/src/components/UsuarioPerfil.js
useEffect(() => {
    const fetchUsuario = async () => {
        try {
            const response = await axios.get('http://localhost:5000/usuarios/me', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setUsuario(response.data);
        } catch (error) {
            console.error('Error al obtener el perfil del usuario:', error);
            setError('Error al obtener el perfil del usuario');
        }
    };
    fetchUsuario();
}, []);


    if (error) {
        return <div>{error}</div>;
    }

    if (!usuario) {
        return <div>Cargando perfil...</div>;
    }

    return (
        <div>
            <h2>Perfil de Usuario</h2>
            <p>ID: {usuario.id_usuario}</p>
            <p>Nombre: {usuario.nombres}</p>
            <p>Apellido Paterno: {usuario.apellido_paterno}</p>
            <p>Apellido Materno: {usuario.apellido_materno}</p>
            <p>Rol: {usuario.rol}</p>
            <p>Celular: {usuario.celular}</p>
        </div>
    );
};

export default UsuarioPerfil;
