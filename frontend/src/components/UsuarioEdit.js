// frontend/src/components/UsuarioEdit.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const UsuarioEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Inicializa el estado con valores por defecto
    const [usuario, setUsuario] = useState({
        Nombres: '',
        Apellido_paterno: '',
        Apellido_materno: '',
        Rol: '',
        Contraseña: '',
        Celular: '',
    });
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const fetchUsuario = async () => {
            try {
                const response = await axios.get(`/usuarios/${id}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                // Asegúrate de que la respuesta tenga todos los campos definidos
                setUsuario({
                    Nombres: response.data.Nombres || '',
                    Apellido_paterno: response.data.Apellido_paterno || '',
                    Apellido_materno: response.data.Apellido_materno || '',
                    Rol: response.data.Rol || '',
                    Contraseña: response.data.Contraseña || '',
                    Celular: response.data.Celular || '',
                });
            } catch (error) {
                console.error('Error al obtener los datos del usuario:', error);
            }
        };

        fetchUsuario();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUsuario(prevState => ({ ...prevState, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsProcessing(true);

        try {
            await axios.put(`/usuarios/${id}`, usuario, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            navigate('/usuarios');
        } catch (error) {
            console.error('Error al actualizar el usuario:', error);
        } finally {
            setIsProcessing(false);
        }
    };
    
    return (
        <div className="container">
            <h2>Editar Usuario</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="Nombres">Nombres</label>
                    <input
                        type="text"
                        className="form-control"
                        id="Nombres"
                        name="Nombres"
                        value={usuario.Nombres}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="Apellido_paterno">Apellido Paterno</label>
                    <input
                        type="text"
                        className="form-control"
                        id="Apellido_paterno"
                        name="Apellido_paterno"
                        value={usuario.Apellido_paterno}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="Apellido_materno">Apellido Materno</label>
                    <input
                        type="text"
                        className="form-control"
                        id="Apellido_materno"
                        name="Apellido_materno"
                        value={usuario.Apellido_materno}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="Rol">Rol</label>
                    <select
                        className="form-control"
                        id="Rol"
                        name="Rol"
                        value={usuario.Rol}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Seleccione un rol</option>
                        <option value="admin">admin</option>
                        <option value="usuario">usuario</option>
                        <option value="secretaria">secretaria</option>
                        <option value="decanatura">decanatura</option>
                        <option value="vicerrectorado">vicerrectorado</option>
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="Contraseña">Contraseña</label>
                    <input
                        type="password"
                        className="form-control"
                        id="Contraseña"
                        name="Contraseña"
                        value={usuario.Contraseña}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="Celular">Celular</label>
                    <input
                        type="text"
                        className="form-control"
                        id="Celular"
                        name="Celular"
                        value={usuario.Celular}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary" disabled={isProcessing}>
                    {isProcessing ? 'Procesando...' : 'Guardar Cambios'}
                </button>
            </form>
        </div>
    );
};

export default UsuarioEdit;


