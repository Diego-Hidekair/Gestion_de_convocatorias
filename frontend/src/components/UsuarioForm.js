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
            const response = await axios.post('http://localhost:5000/usuarios', usuario, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            // Asegúrate de que la respuesta sea exitosa
            if (response.status === 201) {
                // Reiniciar el estado del usuario para limpiar el formulario
                setUsuario({
                    id: '',
                    Nombres: '',
                    Apellido_paterno: '',
                    Apellido_materno: '',
                    Rol: '',
                    Contraseña: '',
                    Celular: ''
                });
                // Redirigir con mensaje
                navigate('/usuarios', { state: { successMessage: 'Usuario creado exitosamente!' } }); 
            }
        } catch (error) {
            console.error('Error al crear el usuario', error.response ? error.response.data : error.message);
            console.log('Estado del error:', error.response ? error.response.status : 'No hay respuesta del servidor');
        }
    };

    return (
        <div className="container mt-5">
            <h2>Crear Usuario</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label>id de ingreso</label>
                    <input type="text" className="form-control" name="id" value={usuario.id} onChange={handleChange} required />
                </div>

                <div className="mb-3">
                    <label>Nombres</label>
                    <input type="text" className="form-control" name="Nombres" value={usuario.Nombres} onChange={handleChange} required />
                </div>
                <div className="mb-3">
                    <label>Apellido Paterno</label>
                    <input type="text" className="form-control" name="Apellido_paterno" value={usuario.Apellido_paterno} onChange={handleChange} required />
                </div>
                <div className="mb-3">
                    <label>Apellido Materno</label>
                    <input type="text" className="form-control" name="Apellido_materno" value={usuario.Apellido_materno} onChange={handleChange} required />
                </div>
                <div className="mb-3">
                    <label>Rol</label>
                    <select className="form-control" name="Rol" value={usuario.Rol} onChange={handleChange} required>
                        <option value="">Seleccione rol</option> {/* Opción predeterminada */}
                        <option value="admin">Admin</option>
                        <option value="usuario">Usuario</option>
                        <option value="secretaria">Secretaria</option>
                        <option value="decanatura">Decanatura</option>
                        <option value="vicerrectorado">Vicerrectorado</option>
                    </select>
                </div>
                <div className="mb-3">
                    <label>Contraseña</label>
                    <input type="password" className="form-control" name="Contraseña" value={usuario.Contraseña} onChange={handleChange} required />
                </div>
                <div className="mb-3">
                    <label>Celular</label>
                    <input type="text" className="form-control" name="Celular" value={usuario.Celular} onChange={handleChange} required />
                </div>
                <button type="submit" className="btn btn-primary">Crear Usuario</button>
            </form>
        </div>
    );
};

export default UsuarioForm;
