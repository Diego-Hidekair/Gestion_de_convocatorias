// frontend/src/components/UsuarioForm.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const UsuarioForm = () => {
    const [usuario, setUsuario] = useState({
        nombres: '',
        apellidoPaterno: '',
        apellidoMaterno: '',
        rol: '',
        contraseña: '',
        celular: ''
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
            await axios.post('/api/usuarios', usuario, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
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
                    <label>Nombres</label>
                    <input type="text" className="form-control" name="nombres" onChange={handleChange} required />
                </div>
                <div className="mb-3">
                    <label>Apellido Paterno</label>
                    <input type="text" className="form-control" name="apellidoPaterno" onChange={handleChange} required />
                </div>
                <div className="mb-3">
                    <label>Apellido Materno</label>
                    <input type="text" className="form-control" name="apellidoMaterno" onChange={handleChange} required />
                </div>
                <div className="mb-3">
                    <label>Rol</label>
                    <input type="text" className="form-control" name="rol" onChange={handleChange} required />
                </div>
                <div className="mb-3">
                    <label>Contraseña</label>
                    <input type="password" className="form-control" name="contraseña" onChange={handleChange} required />
                </div>
                <div className="mb-3">
                    <label>Celular</label>
                    <input type="text" className="form-control" name="celular" onChange={handleChange} required />
                </div>
                <button type="submit" className="btn btn-primary">Guardar</button>
            </form>
        </div>
    );
};

export default UsuarioForm;
