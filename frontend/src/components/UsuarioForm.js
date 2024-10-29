// frontend/src/components/UsuarioForm.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const UsuarioForm = () => {
    const [usuario, setUsuario] = useState({
        id_usuario: '',  
        Nombres: '',
        Apellido_paterno: '',
        Apellido_materno: '',
        Rol: '',
        Contraseña: '',
        Celular: ''
    });
    
    const navigate = useNavigate();

    const handleChange = (e) => {
        setUsuario({
            ...usuario,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/usuarios', usuario, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.status === 201) {
                setUsuario({
                    id_usuario: '', 
                    Nombres: '',
                    Apellido_paterno: '',
                    Apellido_materno: '',
                    Rol: '',
                    Contraseña: '',
                    Celular: ''
                });
                navigate('/usuarios', { state: { successMessage: 'Usuario creado exitosamente!' } }); 
            }
        } catch (error) {
            console.error('Error al crear el usuario', error.response ? error.response.data : error.message);
        }
    };

    return (
        <div className="container-user mt-5-user">
            <h2 className="title-user">Crear Usuario</h2>
            <form onSubmit={handleSubmit} className="form-user">
                <div className="row mb-3-user">
                    <div className="col-md-6">
                        <label className="label-user">ID de Usuario</label>
                        <input type="text" className="form-control-user" name="id_usuario" value={usuario.id_usuario} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6">
                        <label className="label-user">Nombres</label>
                        <input type="text" className="form-control-user" name="Nombres" value={usuario.Nombres} onChange={handleChange} required />
                    </div>
                </div>
                <div className="row mb-3-user">
                    <div className="col-md-6">
                        <label className="label-user">Apellido Paterno</label>
                        <input type="text" className="form-control-user" name="Apellido_paterno" value={usuario.Apellido_paterno} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6">
                        <label className="label-user">Apellido Materno</label>
                        <input type="text" className="form-control-user" name="Apellido_materno" value={usuario.Apellido_materno} onChange={handleChange} required />
                    </div>
                </div>
                <div className="row mb-3-user">
                    <div className="col-md-6">
                        <label className="label-user">Rol</label>
                        <select className="form-control-user" name="Rol" value={usuario.Rol} onChange={handleChange} required>
                            <option value="">Seleccione rol</option>
                            <option value="admin">Admin</option>
                            <option value="usuario">Usuario</option>
                            <option value="secretaria">Secretaria</option>
                            <option value="decanatura">Decanatura</option>
                            <option value="vicerrectorado">Vicerrectorado</option>
                        </select>
                    </div>
                    <div className="col-md-6">
                        <label className="label-user">Celular</label>
                        <input type="text" className="form-control-user" name="Celular" value={usuario.Celular} onChange={handleChange} required />
                    </div>
                </div>
                <div className="mb-3-user">
                    <label className="label-user">Contraseña</label>
                    <input type="password" className="form-control-user" name="Contraseña" value={usuario.Contraseña} onChange={handleChange} required />
                </div>
                <button type="submit" className="btn-user btn-primary-user">Crear Usuario</button>
            </form>
        </div>
    );
};

export default UsuarioForm;
