// frontend/src/components/UsuarioList.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const UsuarioList = () => {
    const [usuarios, setUsuarios] = useState([]);

    useEffect(() => {
        const fetchUsuarios = async () => {
            const response = await axios.get('/api/usuarios', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setUsuarios(response.data);
        };
        fetchUsuarios();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
            await axios.delete(`/api/usuarios/${id}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setUsuarios(usuarios.filter(usuario => usuario.id !== id));
        }
    };

    return (
        <div className="container mt-5">
            <h2>Lista de Usuarios</h2>
            <Link to="/usuarios/nuevo" className="btn btn-primary mb-3">Crear Usuario</Link>
            <table className="table table-striped">
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
                    {usuarios.map(usuario => (
                        <tr key={usuario.id}>
                            <td>{usuario.id}</td>
                            <td>{usuario.nombres}</td>
                            <td>{usuario.apellido_paterno}</td>
                            <td>{usuario.apellido_materno}</td>
                            <td>{usuario.rol}</td>
                            <td>{usuario.celular}</td>
                            <td>
                                <Link to={`/usuarios/editar/${usuario.id}`} className="btn btn-warning me-2">Editar</Link>
                                <button onClick={() => handleDelete(usuario.id)} className="btn btn-danger">Eliminar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UsuarioList;
