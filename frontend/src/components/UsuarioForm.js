// frontend/src/components/UsuarioForm.js
import React, { useState, useEffect } from 'react';
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
        Celular: '',
        id_facultad: '', 
        id_programa: ''  
    });

    const [facultades, setFacultades] = useState([]);
    const [carreras, setCarreras] = useState([]);
    const [foto, setFoto] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchFacultades = async () => {
            try {
                const response = await axios.get('http://localhost:5000/facultades', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                setFacultades(response.data);
            } catch (error) {
                console.error('Error al obtener facultades', error);
            }
        };

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
            [e.target.name]: e.target.value,
        });
    };
    const handleImageChange = (e) => {
        const file = e.target.files ? e.target.files[0] : null;
        setFoto(file);
    };
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.keys(usuario).forEach((key) => {
            formData.append(key, usuario[key]);
        });
        if (foto) {
            formData.append('foto_perfil', foto); // Agregar imagen
        }

        if (!usuario.Contraseña) {
            console.error("La contraseña es obligatoria");
            return;
        }
        
        try {
            const response = await axios.post('http://localhost:5000/usuarios', usuario, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            });
            if (response.status === 201) {
                navigate('/usuarios', { state: { successMessage: 'Usuario creado exitosamente!' } });
            }
            /*if (response.status === 201) {
                setUsuario({
                    id_usuario: '', 
                    Nombres: '',
                    Apellido_paterno: '',
                    Apellido_materno: '',
                    Rol: '',
                    Contraseña: '',
                    Celular: '',
                    id_facultad: '', 
                    id_programa: '' 
                });
                navigate('/usuarios', { state: { successMessage: 'Usuario creado exitosamente!' } });
            }*/
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
                    
                    
                    <div className="row mb-3-user">
                        <div className="col-md-6">
                            <label className="label-user">Foto de Perfil</label>
                            <input type="file" className="form-control-user" onChange={handleImageChange} accept="image/png" />
                        </div>
                    </div>
                    <div className="row mb-3-user">
                        <div className="col-md-6">
                            <label className="label-user">O URL de la Imagen</label>
                            <input type="text" className="form-control-user" name="foto_url" value={usuario.foto_url || ''} onChange={handleChange} />
                        </div>
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