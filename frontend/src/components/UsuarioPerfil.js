// frontend/src/components/UsuarioPerfil.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const UsuarioPerfil = () => {
    const { id } = useParams(); // ID del usuario de la URL
    const navigate = useNavigate(); // Para redirigir
    const [usuario, setUsuario] = useState(null);
    const [error, setError] = useState(null);
    const [userRole, setUserRole] = useState(null); // Rol del usuario que está viendo el perfil

    useEffect(() => {
        const fetchUsuario = async () => {
            const userId = localStorage.getItem('user_id'); // Asegúrate de que user_id esté definido
            const role = localStorage.getItem('user_role'); // Obtenemos el rol del usuario
            setUserRole(role); // Guardamos el rol en el estado

            if (!userId) {
                console.error('No se encontró userId en localStorage');
                return;
            }
            try {
                const response = await axios.get(`http://localhost:5000/usuarios/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                
                // Actualiza el estado con los datos del usuario
                setUsuario(response.data);
            } catch (error) {
                console.error('Error al obtener el perfil del usuario:', error);
                setError('Error al obtener el perfil del usuario'); // Manejo de error
            }
        };

        // Solo hacer la solicitud si id está definido
        if (id) {
            fetchUsuario();
        } else {
            setError('ID de usuario no proporcionado.');
        }
    }, [id]);

    const handleEdit = () => {
        navigate(`/usuarios/edit/${usuario.id}`); // Asegúrate de que 'usuario.id' tenga el valor correcto
    };
    

    if (error) {
        return <div className="alert alert-danger">{error}</div>;
    }

    if (!usuario) {
        return <div>Cargando perfil...</div>;
    }

    return (
        <div className="container mt-5">
            <h2>Perfil de Usuario</h2>
            <button className="btn btn-primary mb-3" onClick={handleEdit}>
                Editar Usuario
            </button>
            <table className="table">
                <tbody>
                    <tr>
                        <th>ID</th>
                        <td>{usuario.id}</td>
                    </tr>
                    <tr>
                        <th>Nombres</th>
                        <td>{usuario.nombres}</td>
                    </tr>
                    <tr>
                        <th>Apellido Paterno</th>
                        <td>{usuario.apellido_paterno}</td>
                    </tr>
                    <tr>
                        <th>Apellido Materno</th>
                        <td>{usuario.apellido_materno}</td>
                    </tr>
                    <tr>
                        <th>Rol</th>
                        <td>
                            {userRole === 'admin' ? (
                                <select
                                    className="form-control"
                                    value={usuario.rol}
                                    onChange={(e) => {
                                        // Aquí podrías manejar el cambio de rol, si lo deseas
                                        console.log('Cambio de rol:', e.target.value);
                                    }}
                                >
                                    <option value="admin">admin</option>
                                    <option value="usuario">usuario</option>
                                    <option value="secretaria">secretaria</option>
                                    <option value="decanatura">decanatura</option>
                                    <option value="vicerrectorado">vicerrectorado</option>
                                </select>
                            ) : (
                                <span>{usuario.rol}</span> // Solo mostrar el rol si no es admin
                            )}
                        </td>
                    </tr>
                    <tr>
                        <th>Celular</th>
                        <td>{usuario.celular}</td>
                    </tr>
                    <tr>
                        <th>Email</th>
                        <td>{usuario.email || 'No disponible'}</td> {/* Manejo de email no disponible */}
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default UsuarioPerfil;
