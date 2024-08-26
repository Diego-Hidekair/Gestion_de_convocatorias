// frontend/src/components/UsuarioList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';


const UsuarioList = () => {
    const [usuarios, setUsuarios] = useState([]);

    useEffect(() => {
        const fetchUsuarios = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/usuarios', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                setUsuarios(response.data);
            } catch (error) {
                console.error('Error al obtener usuarios', error);
            }
        };

        fetchUsuarios();
    }, []);

    const deleteUser = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
            try {
                await axios.delete(`http://localhost:5000/api/usuarios/${id}`, {
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
                            <td>{usuario.nombres}</td>
                            <td>{usuario.apellido_paterno}</td> 
                            <td>{usuario.apellido_materno}</td> 
                            <td>{usuario.rol}</td>
                            <td>{usuario.celular}</td>
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