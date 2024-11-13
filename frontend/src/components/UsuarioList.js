// frontend/src/components/UsuarioList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Usuario.css';

const UsuarioList = () => {
    const [usuarios, setUsuarios] = useState([]);
    const location = useLocation();
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchUsuarios = async () => {
            try {
                const response = await axios.get('http://localhost:5000/usuarios', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                setUsuarios(response.data);
            } catch (error) {
                console.error('Error al obtener usuarios', error);
            }
        };

        fetchUsuarios();

        if (location.state && location.state.successMessage) {
            setSuccessMessage(location.state.successMessage);
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
        }
    }, [location.state]);

    const deleteUser = async (id_usuario) => {  
        if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
            try {
                await axios.delete(`http://localhost:5000/usuarios/${id_usuario}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                setUsuarios(prevUsuarios => prevUsuarios.filter(user => user.id_usuario !== id_usuario));
            } catch (error) {
                console.error('Error al eliminar el usuario', error);
            }
        }
    };
    
    return (
        <div className="container-user mt-5-user">
            <h2 className="title-user">Lista de Usuarios</h2>
            {successMessage && <div className="alert-user alert-success-user">{successMessage}</div>}
            <Link to="/usuarios/new" className="btn-user btn-success-user mb-3-user">Crear Nuevo Usuario</Link>
            
            <div className="usuarios-grid">
                {usuarios.map((usuario) => (
                    <div key={usuario.id_usuario} className="usuario-card">
                        <h5 className="usuario-id">ID: {usuario.id_usuario}</h5>
                        <p className="usuario-name"><strong>Nombre:</strong> {usuario.nombres} {usuario.apellido_paterno} {usuario.apellido_materno}</p>
                        <p className="usuario-role"><strong>Rol:</strong> {usuario.rol}</p>
                        <p className="usuario-phone"><strong>Celular:</strong> {usuario.celular}</p>
                        <p className="usuario-phone"><strong>Facultad:</strong> {usuario.nombre_facultad}</p>
                        <p className="usuario-phone"><strong>Carrera:</strong> {usuario.nombre_carrera}</p>
                        <div className="usuario-actions">
                            <Link to={`/usuarios/edit/${usuario.id_usuario}`} className="btn-user btn-primary-user">
                                Editar
                            </Link>
                            <button onClick={() => deleteUser(usuario.id_usuario)} className="btn-user btn-danger-user ms-2-user">
                                Eliminar
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UsuarioList;
