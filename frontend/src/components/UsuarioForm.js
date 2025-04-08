// frontend/src/components/UsuarioForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const UsuarioForm = () => {
    const [usuario, setUsuario] = useState({
        id_usuario: '',  
        nombres: '',
        apellido_paterno: '',
        apellido_materno: '',
        rol: '',
        contraseña: '',
        celular: '',
        id_facultad: '', 
        id_programa: ''  
    });

    const [facultades, setFacultades] = useState([]);
    const [carreras, setCarreras] = useState([]);
    const [foto, setFoto] = useState(null);
    const [loadingCarreras, setLoadingCarreras] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Roles válidos con nombres descriptivos
    const rolesValidos = [
        { value: 'admin', label: 'Administrador' },
        { value: 'personal_administrativo', label: 'Personal Administrativo' },
        { value: 'secretaria_de_decanatura', label: 'Secretaría de Decanatura' },
        { value: 'tecnico_vicerrectorado', label: 'Técnico de Vicerrectorado' },
        { value: 'vicerrectorado', label: 'Vicerrectorado' }
    ];

    useEffect(() => {
        const fetchFacultades = async () => {
            try {
                const response = await axios.get('http://localhost:5000/facultades', {
                    headers: { 
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                });
                setFacultades(response.data);
            } catch (error) {
                console.error('Error al obtener facultades:', error);
                setError('Error al cargar facultades. Por favor, recarga la página.');
            }
        };
        fetchFacultades();
    }, []);
    
    const fetchCarrerasByFacultad = async (idFacultad) => {
        if (!idFacultad) {
            setCarreras([]);
            return;
        }

        setLoadingCarreras(true);
        setError('');
        
        try {
            const response = await axios.get(
                `http://localhost:5000/carreras/facultad/${idFacultad}`, 
                {
                    headers: { 
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            if (!Array.isArray(response.data)) {
                throw new Error('Formato de datos incorrecto');
            }
            
            setCarreras(response.data);
        } catch (error) {
            console.error('Error al cargar carreras:', error);
            setError('No se pudieron cargar las carreras. Intente nuevamente.');
            setCarreras([]);
        } finally {
            setLoadingCarreras(false);
        }
    };
    
    const handleFacultadChange = async (e) => {
        const idFacultad = e.target.value;
        setUsuario(prev => ({ 
            ...prev, 
            id_facultad: idFacultad, 
            id_programa: '' 
        }));
        await fetchCarrerasByFacultad(idFacultad);
    };
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setUsuario(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        setFoto(e.target.files?.[0] || null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        // Validaciones básicas
        if (!usuario.contraseña) {
            setError("La contraseña es obligatoria");
            return;
        }
        
        // Crear FormData correctamente
        const formData = new FormData();
        
        // Agregar campos de texto
        formData.append('id_usuario', usuario.id_usuario);
        formData.append('Nombres', usuario.nombres);
        formData.append('Apellido_paterno', usuario.apellido_paterno);
        formData.append('Apellido_materno', usuario.apellido_materno || '');
        formData.append('Rol', usuario.rol);
        formData.append('Contraseña', usuario.contraseña);
        formData.append('Celular', usuario.celular || '');
        formData.append('id_facultad', usuario.id_facultad || '');
        formData.append('id_programa', usuario.id_programa || '');
    
        // Agregar archivo si existe
        if (foto) {
            formData.append('foto_perfil', foto);
        }
    
        try {
            const response = await axios.post('http://localhost:5000/usuarios', formData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 10000 // 10 segundos de timeout
            });
            
            if (response.status === 201) {
                navigate('/usuarios', { 
                    state: { 
                        success: 'Usuario creado exitosamente!' 
                    } 
                });
            }
        } catch (error) {
            console.error('Error al crear usuario:', error);
            let errorMessage = 'Error al crear el usuario';
            
            if (error.response) {
                errorMessage = error.response.data.error || 
                             error.response.data.message || 
                             `Error ${error.response.status}`;
            } else if (error.request) {
                errorMessage = 'No se recibió respuesta del servidor';
            } else {
                errorMessage = error.message;
            }
            
            setError(errorMessage);
        }
    };

    return (
        <div className="container-user mt-5-user">
            <h2 className="title-user">Crear Usuario</h2>
            {error && (
                <div className="alert alert-danger" style={{ marginBottom: '20px' }}>
                    {error}
                </div>
            )}
            <form onSubmit={handleSubmit} className="form-user">
                <div className="row mb-3-user">
                    <div className="col-md-6">
                        <label className="label-user">ID de Usuario</label>
                        <input type="text" className="form-control-user" name="id_usuario" value={usuario.id_usuario} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6">
                        <label className="label-user">Foto de Perfil</label>
                        <input type="file" className="form-control-user" onChange={handleImageChange} accept="image/png" />
                    </div>
                </div>

                <div className="row mb-3-user">
                    <div className="col-md-6">
                        <label className="label-user">Nombres</label>
                        <input type="text" className="form-control-user" name="Nombres" value={usuario.Nombres} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6">
                        <label className="label-user">Apellido Paterno</label>
                        <input type="text" className="form-control-user" name="Apellido_paterno" value={usuario.Apellido_paterno} onChange={handleChange} required />
                    </div>
                </div>

                <div className="row mb-3-user">
                    <div className="col-md-6">
                        <label className="label-user">Facultad :</label>
                        <select className="form-control-user" name="id_facultad" value={usuario.id_facultad} onChange={handleFacultadChange} required>
                            <option value="">Seleccione facultad</option>
                            {facultades.map(facultad => (
                                <option key={facultad.id_facultad} value={facultad.id_facultad}>
                                    {facultad.nombre_facultad}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-6">
                        <label className="label-user">Carrera</label>
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
                        <select 
                            className="form-control-user" 
                            name="rol" 
                            value={usuario.rol} 
                            onChange={handleChange} 
                            required
                        >
                            <option value="">Seleccione rol</option>
                            {rolesValidos.map((rol) => (
                                <option key={rol.value} value={rol.value}>
                                    {rol.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-6">
                        <label className="label-user">Celular</label>
                        <input 
                            type="tel" 
                            className="form-control-user" 
                            name="celular" 
                            value={usuario.celular} 
                            onChange={handleChange} 
                            required 
                            maxLength="15"
                        />
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