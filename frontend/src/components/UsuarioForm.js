// frontend/src/components/UsuarioForm.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const UsuarioForm = () => {
    const [usuario, setUsuario] = useState({
        id: '',
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
            await axios.post('/usuarios', usuario, {
                //headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            navigate('/usuarios');
        } catch (error) {
            console.error('Error al crear el usuario', error);
        }
    };

    return (
        <div className="container mt-5">
            <h2>Crear Usuario</h2>
            <form onSubmit={handleSubmit}>
                

                <div className="mb-3">
                    <label>id de ingreso</label>
                    <input type="text" className="form-control" name="id" onChange={handleChange} required />
                </div>

                <div className="mb-3">
                    <label>Nombres</label>
                    <input type="text" className="form-control" name="Nombres" onChange={handleChange} required />
                </div>
                <div className="mb-3">
                    <label>Apellido Paterno</label>
                    <input type="text" className="form-control" name="" onChange={handleChange} required />
                </div>
                <div className="mb-3">
                    <label>Apellido Materno</label>
                    <input type="text" className="form-control" name="Apellido_materno" onChange={handleChange} required />
                </div>
                <div className="mb-3">
                    <label>Rol</label>
                    <select className="form-control" name="Rol" onChange={handleChange} required>
                        <option value="admin">admin</option>
                        <option value="usuario">usuario</option>
                        <option value="secretaria">secretaria</option>
                        <option value="decanatura">decanatura</option>
                        <option value="vicerrectorado">vicerrectorado</option>
                    </select>
                </div>
                <div className="mb-3">
                    <label>Contraseña</label>
                    <input type="password" className="form-control" name="Contraseña" onChange={handleChange} required />
                </div>
                <div className="mb-3">
                    <label>Celular</label>
                    <input type="text" className="form-control" name="Celular" onChange={handleChange} required />
                </div>
                <button type="submit" className="btn btn-primary">Crear Usuario</button>
            </form>
        </div>
    );
};

export default UsuarioForm;
