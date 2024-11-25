// frontend/src/components/UsuarioForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Usuario.css';

const DEFAULT_PROFILE_PICTURE = '/imagenes/avatar.png'; // Ruta de la foto predeterminada en el frontend

const UsuarioForm = () => {
    const [facultades, setFacultades] = useState([]);
    const [carreras, setCarreras] = useState([]);
    const [previewImage, setPreviewImage] = useState(DEFAULT_PROFILE_PICTURE);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const [usuario, setUsuario] = useState({
        id_usuario: '',
        Nombres: '',
        Apellido_paterno: '',
        Apellido_materno: '',
        Rol: '',
        Contraseña: '',
        Celular: '',
        id_facultad: '',
        id_programa: '',
        foto_perfil: '',
    });
    
     useEffect(() => {
        const fetchFacultades = async () => {
            try {
                const response = await axios.get('http://localhost:5000/facultades', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                });
                setFacultades(response.data);
            } catch (error) {
                console.error('Error al obtener facultades:', error);
            }
        };

        fetchFacultades();
    }, []);
    
    useEffect(() => {
        if (usuario.id_facultad) {
            const fetchCarreras = async () => {
                try {
                    const response = await axios.get(`http://localhost:5000/carreras/${usuario.id_facultad}`, {
                        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                    });
                    setCarreras(response.data);
                } catch (error) {
                    console.error('Error al obtener carreras:', error);
                }
            };

            fetchCarreras();
        } else {
            setCarreras([]);
        }
    }, [usuario.id_facultad]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUsuario({ ...usuario, [name]: value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setUsuario({ ...usuario, foto_perfil: file });
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();

        Object.keys(usuario).forEach((key) => {
            if (key === 'foto_perfil' && usuario[key]) {
                formData.append(key, usuario[key]);
            } else if (key !== 'foto_perfil') {
                formData.append(key, usuario[key]);
            }
        });

        try {
            await axios.post('http://localhost:5000/usuarios', formData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            setError('');
            setUsuario({
                id_usuario: '',
                Nombres: '',
                Apellido_paterno: '',
                Apellido_materno: '',
                Rol: '',
                Contraseña: '',
                Celular: '',
                id_facultad: '',
                id_programa: '',
                foto_perfil: '',
            });
            setPreviewImage(DEFAULT_PROFILE_PICTURE);
            navigate('/usuarios');
        } catch (error) {
            setError(error.response ? error.response.data.message : 'Error al crear el usuario.');
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
                    <div className="form-group">
                    <label htmlFor="foto_perfil">Foto de Perfil</label>
                    <input
                        type="file"
                        id="foto_perfil"
                        name="foto_perfil"
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                </div>
                <div className="image-preview">
                    <label>Vista previa:</label>
                    <img src={previewImage} alt="Vista previa" className="preview-image" />
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
                        <select className="form-control-user" name="id_facultad" value={usuario.id_facultad} onChange={handleChange} required>
                            <option value="">Seleccione facultad</option>
                            {facultades.map(facultad => (
                                <option key={facultad.id_facultad} value={facultad.id_facultad}>
                                    {facultad.nombre_facultad}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-6">
                        <label className="label-user">Programa</label>
                        <select className="form-control-user" name="id_programa" value={usuario.id_programa} onChange={handleChange} required>
                            <option value="">Seleccione programa</option>
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