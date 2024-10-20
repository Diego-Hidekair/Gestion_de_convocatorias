// frontend/src/components/UsuarioEdit.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const UsuarioEdit = () => {
    const { id_usuario } = useParams();  // Asegúrate de que 'id' se obtenga correctamente
    const navigate = useNavigate();

    // Inicializa el estado con valores por defecto
    const [usuario, setUsuario] = useState({
        Nombres: '',
        Apellido_paterno: '',
        Apellido_materno: '',
        Rol: '',
        Contraseña: '', // Campo opcional para cambiar la contraseña
        Celular: '',
    });
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const fetchUsuario = async () => {
            if (!id_usuario) {
                console.error('El ID del usuario es indefinido.');
                return;
            }
        
            try {
                const response = await axios.get(`http://localhost:5000/usuarios/${id_usuario}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                
                // Ajusta los campos según los nombres de la base de datos
                setUsuario({
                    Nombres: response.data.nombres || '',
                    Apellido_paterno: response.data.apellido_paterno || '',
                    Apellido_materno: response.data.apellido_materno || '',
                    Rol: response.data.rol || '',
                    Contraseña: '',  // No enviar la contraseña al cargar
                    Celular: response.data.celular || ''
                });
            } catch (error) {
                console.error('Error al obtener los datos del usuario:', error);
            }
        };
    
        fetchUsuario();
    }, [id_usuario]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUsuario(prevState => ({ ...prevState, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsProcessing(true);
    
        try {
            // Evita enviar la contraseña vacía si no ha sido modificada
            const usuarioAEnviar = { ...usuario };
            if (!usuarioAEnviar.Contraseña) {
                delete usuarioAEnviar.Contraseña;  // No envía la contraseña si está vacía
            }
    
            await axios.put(`/usuarios/${id_usuario}`, usuarioAEnviar, {  
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
                        placeholder="Dejar en blanco para no cambiar"
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