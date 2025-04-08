// frontend/src/components/UsuarioPerfil.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/Usuario.css';

const UsuarioPerfil = () => {
    const [usuario, setUsuario] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsuario = async () => {
            try {
                const response = await axios.get('http://localhost:5000/usuarios/me', {
                    headers: { 
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                // Mapear nombres de roles más descriptivos
                const rolesDescriptivos = {
                    'admin': 'Administrador',
                    'personal_administrativo': 'Personal Administrativo',
                    'secretaria_de_decanatura': 'Secretaría de Decanatura',
                    'tecnico_vicerrectorado': 'Técnico de Vicerrectorado',
                    'vicerrectorado': 'Vicerrectorado'
                };
                
                const usuarioData = {
                    ...response.data,
                    rolDescriptivo: rolesDescriptivos[response.data.rol] || response.data.rol
                };
                
                setUsuario(usuarioData);
            } catch (error) {
                console.error('Error al obtener el perfil del usuario:', error);
                setError('Error al cargar el perfil. Intente recargar la página.');
            } finally {
                setLoading(false);
            }
        };
        
        fetchUsuario();
    }, []);

    if (loading) {
        return <div className="loading-user">Cargando perfil...</div>;
    }

    if (error) {
        return <div className="alert alert-danger">{error}</div>;
    }

    return (
        <div className="container-user perfil-container-user">
            <h2 className="title-user">Perfil de Usuario</h2>
            <div className="perfil-content-user">
                <img 
                    src={usuario.foto_perfil ? `data:image/jpeg;base64,${usuario.foto_perfil}` : "/imagenes/avatar.png"} 
                    alt="Perfil" 
                    className="perfil-image-user" 
                />
                <div className="usuario-info-container-user">
                    <p className="usuario-name-user">
                        <strong>Nombre completo:</strong> {usuario.nombres} {usuario.apellido_paterno} {usuario.apellido_materno}
                    </p>
                    <p className="usuario-role-user">
                        <strong>Rol:</strong> {usuario.rolDescriptivo}
                    </p>
                    <p className="usuario-phone-user">
                        <strong>Celular:</strong> {usuario.celular || 'No registrado'}
                    </p>
                    <p className="usuario-phone-user">
                        <strong>Facultad:</strong> {usuario.nombre_facultad || 'No asignada'}
                    </p>
                    <p className="usuario-phone-user">
                        <strong>Carrera:</strong> {usuario.nombre_carrera || 'No asignada'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UsuarioPerfil;