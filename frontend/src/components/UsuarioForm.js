// frontend/src/components/UsuarioForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const UsuarioForm = () => {
    const [usuario, setUsuario] = useState({ id_usuario: '', Nombres: '', Apellido_paterno: '', Apellido_materno: '', Rol: '', Contraseña: '', Celular: '', id_facultad: '', id_programa: '', foto_perfil: null });
    
    const [facultades, setFacultades] = useState([]);
    const [carreras, setCarreras] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchFacultadesYProgramas = async () => {
            try {
                const [facultadesResponse, programasResponse] = await Promise.all([
                    axios.get('http://localhost:5000/facultades', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }),
                    axios.get('http://localhost:5000/programas', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }),
                ]);
                setFacultades(facultadesResponse.data);
                setCarreras(programasResponse.data);
            } catch (error) {
                console.error('Error al cargar facultades y programas:', error);
            }
        };
    
        fetchFacultadesYProgramas();
    }, []);

        const fetchCarreras = async () => {
            try {
                const response = await axios.get('http://localhost:5000/carreras', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                setCarreras(response.data);
            } catch (error) {
                console.error('Error al obtener carreras', error);
            }
        };

        fetchFacultades();
        fetchCarreras();
    }, []);

    const handleChange = (e) => {
        setUsuario({
            ...usuario,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        const formData = new FormData();
        Object.entries(usuario).forEach(([key, value]) => {
            formData.append(key, value);
        });
    
        try {
            const response = await axios.post('http://localhost:5000/usuarios', formData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            alert('Usuario creado exitosamente');
            navigate('/usuarios'); // Redirige a la lista de usuarios
        } catch (error) {
            console.error('Error al crear usuario:', error);
            alert('Hubo un error al crear el usuario');
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
                        <label className="label-user">Facultad</label>
                        <select className="form-control-user" name="id_facultad" value={usuario.id_facultad}
                            onChange={(e) => setUsuario({ ...usuario, id_facultad: e.target.value })}
                            required >
                            <option value="">Seleccionar facultad</option>
                            {facultades.map(facultad => (
                                <option key={facultad.id_facultad} value={facultad.id_facultad}>
                                    {facultad.nombre_facultad}
                                </option>
                            ))}
                        </select>
                    <div className="col-md-6">
                        <label className="label-user">Programa</label>
                        <select className="form-control-user" name="id_programa" value={usuario.id_programa}
                            onChange={(e) => setUsuario({ ...usuario, id_programa: e.target.value })}
                            required
                        >
                            <option value="">Seleccionar programa</option>
                            {carreras.map(carrera => (
                                <option key={carrera.id_programa} value={carrera.id_programa}>
                                    {carrera.nombre_carrera}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="row mb-3-user">
                    <div className="col-md-6">
                        <label className="label-user">Rol</label>
                        <select className="form-control-user" name="Rol" value={usuario.Rol}  onChange={(e) => setUsuario({ ...usuario, Rol: e.target.value })} required>
                            <option value="">Seleccionar rol</option>
                            <option value="admin">Administrador</option>
                            <option value="usuario">Usuario</option>
                            <option value="secretaria">Secretaría</option>
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