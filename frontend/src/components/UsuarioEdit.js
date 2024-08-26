// frontend/src/components/UsuarioEdit.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const UsuarioEdit = () => {
    const [usuario, setUsuario] = useState({
        id: '',
        nombres: '',
        apellidoPaterno: '',
        apellidoMaterno: '',
        rol: '',
        contraseña: '',
        celular: ''
    });
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsuario = async () => {
            try {
                const response = await axios.get(`/api/usuarios/${id}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                setUsuario(response.data);
            } catch (error) {
                console.error('Error al obtener el usuario', error);
            }
        };
        fetchUsuario();
    }, [id]);

    const handleChange = (e) => {
        setUsuario({
            ...usuario,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`/api/usuarios/${id}`, usuario, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            navigate('/usuarios');
        } catch (error) {
            console.error('Error al actualizar el usuario', error);
        }
    };

    const deleteUser = async () => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
            try {
                await axios.delete(`/api/usuarios/${id}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                navigate('/usuarios');
            } catch (error) {
                console.error('Error al eliminar el usuario', error);
            }
        }
    };

    return (
        <div className="container mt-5">
            <h2>Editar Usuario</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label>ID</label>
                    <input type="text" className="form-control" name="id" value={usuario.id} readOnly />
                </div>
                <div className="mb-3">
                    <label>Nombres</label>
                    <input type="text" className="form-control" name="nombres" value={usuario.nombres} onChange={handleChange} required />
                </div>
                <div className="mb-3">
                    <label>Apellido Paterno</label>
                    <input type="text" className="form-control" name="apellidoPaterno" value={usuario.apellidoPaterno} onChange={handleChange} required />
                </div>
                <div className="mb-3">
                    <label>Apellido Materno</label>
                    <input type="text" className="form-control" name="apellidoMaterno" value={usuario.apellidoMaterno} onChange={handleChange} required />
                </div>
                <div className="mb-3">
                    <label>Rol</label>
                    <input type="text" className="form-control" name="rol" value={usuario.rol} onChange={handleChange} required />
                </div>
                <div className="mb-3">
                    <label>Contraseña</label>
                    <input type="password" className="form-control" name="contraseña" onChange={handleChange} />
                </div>
                <div className="mb-3">
                    <label>Celular</label>
                    <input type="text" className="form-control" name="celular" value={usuario.celular} onChange={handleChange} required />
                </div>
                <button type="submit" className="btn btn-primary">Guardar</button>
                <button type="button" onClick={deleteUser} className="btn btn-danger ms-2">Eliminar</button>
            </form>
        </div>
    );
};

export default UsuarioEdit;

