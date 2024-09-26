// frontend/src/components/UsuarioList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';

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

        // Mostrar el mensaje de éxito si existe en la ubicación
        if (location.state && location.state.successMessage) {
            setSuccessMessage(location.state.successMessage);
            setTimeout(() => {
                setSuccessMessage(''); 
            }, 3000);
        }
    }, [location.state]);

    const deleteUser = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
            try {
                await axios.delete(`http://localhost:5000/usuarios/${id}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                setUsuarios(usuarios.filter(user => user.id !== id));
            } catch (error) {
                console.error('Error al eliminar el usuario', error);
            }
        }
    };
    
    return (
        <div className="container mt-5">
            <h2>Lista de Usuarios</h2>
            {successMessage && <div className="alert alert-success">{successMessage}</div>} {/* Mostrar mensaje de éxito */}
            <Link to="/usuarios/new" className="btn btn-success mb-3">Crear Nuevo Usuario</Link>
            <table className="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombres</th>
                        <th>Apellido Paterno</th>
                        <th>Apellido Materno</th>
                        <th>Rol</th>
                        <th>Celular</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {usuarios.map((usuario) => (
                        <tr key={usuario.id}>
                            <td>{usuario.id}</td>
                            <td>{usuario.nombres}</td> {/* Asegúrate de que el campo en tu backend sea "nombres" */}
                            <td>{usuario.apellido_paterno}</td> {/* Asegúrate de que el campo en tu backend sea "apellido_paterno" */}
                            <td>{usuario.apellido_materno}</td> {/* Asegúrate de que el campo en tu backend sea "apellido_materno" */}
                            <td>{usuario.rol}</td> {/* Asegúrate de que el campo en tu backend sea "rol" */}
                            <td>{usuario.celular}</td> {/* Asegúrate de que el campo en tu backend sea "celular" */}
                            <td>
                                <Link to={`/usuarios/edit/${usuario.id}`} className="btn btn-primary btn-sm">
                                    Editar
                                </Link>
                                <button onClick={() => deleteUser(usuario.id)} className="btn btn-danger btn-sm ms-2">
                                    Eliminar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UsuarioList;