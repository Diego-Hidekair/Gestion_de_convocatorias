// frontend/src/components/UsuarioPerfil.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/Usuario.css';

const UsuarioPerfil = () => {
    const [usuario, setUsuario] = useState(null);
    const [error, setError] = useState(null);

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
        return <div className="alert-user">{error}</div>;
    }

    if (!usuario) {
        return <div className="loading-user">Cargando perfil...</div>;
    }

    return (
        <div className="container-user perfil-container-user">
            <h2 className="title-user">Perfil de Usuario</h2>
            <div className="perfil-content-user">
                <img src="/imagenes/avatar.png" alt="Perfil" className="perfil-image-user" />
                <div className="usuario-info-container-user">
                    <p className="usuario-name-user">Nombre: {usuario.nombres}</p>
                    <p className="usuario-apellido-paterno-user">Apellido Paterno: {usuario.apellido_paterno}</p>
                    <p className="usuario-apellido-materno-user">Apellido Materno: {usuario.apellido_materno}</p>
                    <p className="usuario-role-user">Rol: {usuario.rol}</p>
                    <p className="usuario-phone-user">Celular: {usuario.celular}</p>
                </div>
            </div>
        </div>
    );
};

export default UsuarioPerfil;
