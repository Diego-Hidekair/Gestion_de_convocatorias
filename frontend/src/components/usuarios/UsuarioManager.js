// frontend/src/components/usuarios/UsuarioManager.js

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
    Box, Typography, TextField, Button, Select, MenuItem, 
    FormControl, InputLabel, Card, CardContent, Avatar,
    IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
    CircularProgress, Alert
} from '@mui/material';
import { 
    Edit as EditIcon, 
    Delete as DeleteIcon, 
    Visibility as VisibilityIcon,
    ArrowBack as ArrowBackIcon,
    Save as SaveIcon,
    PersonAdd as PersonAddIcon
} from '@mui/icons-material';

axios.defaults.baseURL = 'http://localhost:5000';

const UsuarioManager = () => {
    // Hooks de routing
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();

    // Estados principales
    const [mode, setMode] = useState('list'); // 'list', 'view', 'edit', 'create'
    const [usuarios, setUsuarios] = useState([]);
    const [usuario, setUsuario] = useState({
        id_usuario: '',
        nombres: '',
        apellido_paterno: '',
        apellido_materno: '',
        rol: '',
        contraseña: '',
        celular: '',
        id_programa: '',
        foto_perfil: null
    });
    
    // Estados auxiliares
    const [facultades, setFacultades] = useState([]);
    const [carreras, setCarreras] = useState([]);
    const [foto, setFoto] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [usuarioToDelete, setUsuarioToDelete] = useState(null);

    // Constantes
    const rolesValidos = [
        { value: 'admin', label: 'Administrador' },
        { value: 'personal_administrativo', label: 'Personal Administrativo' },
        { value: 'secretaria_de_decanatura', label: 'Secretaría de Decanatura' },
        { value: 'tecnico_vicerrectorado', label: 'Técnico de Vicerrectorado' },
        { value: 'vicerrectorado', label: 'Vicerrectorado' }
    ];

    // Determinar el modo basado en la ruta
    useEffect(() => {
        const path = location.pathname;
        if (path.includes('/usuarios/edit/')) {
            setMode('edit');
            fetchUsuario();
        } else if (path.includes('/usuarios/view/') || path.includes('/usuarios/me/')) {
            setMode('view');
            fetchUsuario();
        } else if (path.endsWith('/usuarios/new')) {
            setMode('create');
        } else {
            setMode('list');
            fetchUsuarios();
        }

        if (mode === 'create' || mode === 'edit') {
            fetchFacultades();
        }

        if (location.state?.successMessage) {
            setSuccess(location.state.successMessage);
            setTimeout(() => setSuccess(''), 3000);
        }
    }, [location.pathname]);

    // Funciones de API
    const fetchUsuarios = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/usuarios', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setUsuarios(response.data);
        } catch (error) {
            console.error('Error al obtener usuarios:', error);
            setError('Error al cargar usuarios');
        } finally {
            setLoading(false);
        }
    };

    const fetchUsuario = async () => {
        try {
            setLoading(true);
            const endpoint = mode === 'view' && id === 'me' ? 'me' : id;
            const response = await axios.get(`/usuarios/${endpoint}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            
            setUsuario({
                ...response.data,
                contraseña: '' // No mostrar la contraseña actual
            });
        } catch (error) {
            console.error('Error al obtener usuario:', error);
            setError('Error al cargar usuario');
        } finally {
            setLoading(false);
        }
    };

    const fetchFacultades = async () => {
        try {
            const response = await axios.get('/facultades', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setFacultades(response.data);
        } catch (error) {
            console.error('Error al obtener facultades:', error);
            setError('Error al cargar facultades');
        }
    };

    const fetchCarreras = async (idFacultad) => {
        if (!idFacultad) {
            setCarreras([]);
            return;
        }

        try {
            setLoading(true);
            const response = await axios.get(`/carreras/facultad/${idFacultad}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setCarreras(response.data);
        } catch (error) {
            console.error('Error al cargar carreras:', error);
            setError('Error al cargar carreras');
        } finally {
            setLoading(false);
        }
    };

    // Handlers
    const handleChange = (e) => {
        const { name, value } = e.target;
        setUsuario(prev => ({ ...prev, [name]: value }));
    };

    const handleFacultadChange = async (e) => {
        const idFacultad = e.target.value;
        setUsuario(prev => ({ 
            ...prev, 
            id_facultad: idFacultad, 
            id_programa: '' 
        }));
        await fetchCarreras(idFacultad);
    };

    const handleImageChange = (e) => {
        setFoto(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            if (mode === 'create') {
                await createUsuario();
            } else {
                await updateUsuario();
            }
        } catch (error) {
            console.error('Error al guardar usuario:', error);
            setError(error.response?.data?.error || 'Error al guardar usuario');
        } finally {
            setLoading(false);
        }
    };

    const createUsuario = async () => {
        const formData = new FormData();
        Object.entries(usuario).forEach(([key, value]) => {
            if (value) formData.append(key, value);
        });
        if (foto) formData.append('foto_perfil', foto);

        await axios.post('/usuarios', formData, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'multipart/form-data'
            }
        });

        setSuccess('Usuario creado exitosamente!');
        setTimeout(() => navigate('/usuarios'), 1500);
    };

    const updateUsuario = async () => {
        const dataToSend = { ...usuario };
        if (!dataToSend.contraseña) delete dataToSend.contraseña;

        await axios.put(`/usuarios/${id}`, dataToSend, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        setSuccess('Usuario actualizado exitosamente!');
        setTimeout(() => navigate('/usuarios'), 1500);
    };

    const handleDeleteClick = (idUsuario) => {
        setUsuarioToDelete(idUsuario);
        setOpenDeleteDialog(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await axios.delete(`/usuarios/${usuarioToDelete}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setUsuarios(usuarios.filter(u => u.id_usuario !== usuarioToDelete));
            setSuccess('Usuario eliminado exitosamente');
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            setError('Error al eliminar usuario');
        } finally {
            setOpenDeleteDialog(false);
            setUsuarioToDelete(null);
        }
    };

    // Renderizado condicional
    const renderList = () => (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">Lista de Usuarios</Typography>
                <Button 
                    variant="contained" 
                    startIcon={<PersonAddIcon />}
                    onClick={() => navigate('/usuarios/new')}
                >
                    Nuevo Usuario
                </Button>
            </Box>

            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 3 }}>
                    {usuarios.map((user) => (
                        <Card key={user.id_usuario}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Avatar 
                                        src={user.foto_perfil ? `data:image/jpeg;base64,${user.foto_perfil}` : '/default-avatar.png'}
                                        sx={{ width: 56, height: 56, mr: 2 }}
                                    />
                                    <Box>
                                        <Typography variant="h6">{user.nombres} {user.apellido_paterno}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {rolesValidos.find(r => r.value === user.rol)?.label || user.rol}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    <strong>ID:</strong> {user.id_usuario}
                                </Typography>
                                {user.nombre_carrera && (
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        <strong>Carrera:</strong> {user.nombre_carrera}
                                    </Typography>
                                )}
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                    <IconButton onClick={() => navigate(`/usuarios/edit/${user.id_usuario}`)}>
                                        <EditIcon color="primary" />
                                    </IconButton>
                                    <IconButton onClick={() => handleDeleteClick(user.id_usuario)}>
                                        <DeleteIcon color="error" />
                                    </IconButton>
                                    <IconButton onClick={() => navigate(`/usuarios/view/${user.id_usuario}`)}>
                                        <VisibilityIcon color="info" />
                                    </IconButton>
                                </Box>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            )}
        </Box>
    );

    const renderForm = () => (
        <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <IconButton onClick={() => navigate('/usuarios')} sx={{ mr: 1 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4">
                    {mode === 'create' ? 'Crear Usuario' : 'Editar Usuario'}
                </Typography>
            </Box>

            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <TextField
                        fullWidth
                        label="ID de Usuario"
                        name="id_usuario"
                        value={usuario.id_usuario}
                        onChange={handleChange}
                        required
                        disabled={mode === 'edit'}
                    />
                    <Box sx={{ width: '100%' }}>
                        <input
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="foto-perfil"
                            type="file"
                            onChange={handleImageChange}
                        />
                        <label htmlFor="foto-perfil">
                            <Button variant="outlined" component="span" fullWidth sx={{ height: '100%' }}>
                                {foto ? 'Cambiar Foto' : 'Seleccionar Foto'}
                            </Button>
                        </label>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <TextField
                        fullWidth
                        label="Nombres"
                        name="nombres"
                        value={usuario.nombres}
                        onChange={handleChange}
                        required
                    />
                    <TextField
                        fullWidth
                        label="Apellido Paterno"
                        name="apellido_paterno"
                        value={usuario.apellido_paterno}
                        onChange={handleChange}
                        required
                    />
                    <TextField
                        fullWidth
                        label="Apellido Materno"
                        name="apellido_materno"
                        value={usuario.apellido_materno}
                        onChange={handleChange}
                    />
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <FormControl fullWidth>
                        <InputLabel>Rol</InputLabel>
                        <Select
                            label="Rol"
                            name="rol"
                            value={usuario.rol}
                            onChange={handleChange}
                            required
                        >
                            {rolesValidos.map(rol => (
                                <MenuItem key={rol.value} value={rol.value}>
                                    {rol.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        fullWidth
                        label="Celular"
                        name="celular"
                        value={usuario.celular}
                        onChange={handleChange}
                    />
                </Box>

                {mode === 'create' && (
                    <TextField
                        fullWidth
                        label="Contraseña"
                        name="contraseña"
                        type="password"
                        value={usuario.contraseña}
                        onChange={handleChange}
                        required
                        sx={{ mb: 3 }}
                    />
                )}

                {mode === 'edit' && (
                    <TextField
                        fullWidth
                        label="Nueva Contraseña (dejar en blanco para no cambiar)"
                        name="contraseña"
                        type="password"
                        value={usuario.contraseña}
                        onChange={handleChange}
                        sx={{ mb: 3 }}
                    />
                )}

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button
                        variant="outlined"
                        onClick={() => navigate('/usuarios')}
                        disabled={loading}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                        disabled={loading}
                    >
                        {loading ? 'Guardando...' : 'Guardar'}
                    </Button>
                </Box>
            </Box>
        </Box>
    );

    const renderView = () => (
        <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <IconButton onClick={() => navigate('/usuarios')} sx={{ mr: 1 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4">Perfil de Usuario</Typography>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Card>
                    <CardContent>
                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                <Avatar 
                                    src={usuario.foto_perfil ? `data:image/jpeg;base64,${usuario.foto_perfil}` : '/default-avatar.png'}
                                    sx={{ width: 150, height: 150 }}
                                />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="h5" sx={{ mb: 2 }}>
                                    {usuario.nombres} {usuario.apellido_paterno} {usuario.apellido_materno}
                                </Typography>
                                
                                <Typography variant="body1" sx={{ mb: 1 }}>
                                    <strong>ID:</strong> {usuario.id_usuario}
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 1 }}>
                                    <strong>Rol:</strong> {rolesValidos.find(r => r.value === usuario.rol)?.label || usuario.rol}
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 1 }}>
                                    <strong>Celular:</strong> {usuario.celular || 'No registrado'}
                                </Typography>
                                {usuario.nombre_carrera && (
                                    <Typography variant="body1" sx={{ mb: 1 }}>
                                        <strong>Carrera:</strong> {usuario.nombre_carrera}
                                    </Typography>
                                )}
                                
                                {mode === 'view' && id !== 'me' && (
                                    <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                                        <Button
                                            variant="contained"
                                            startIcon={<EditIcon />}
                                            onClick={() => navigate(`/usuarios/edit/${id}`)}
                                        >
                                            Editar
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            startIcon={<DeleteIcon />}
                                            onClick={() => handleDeleteClick(id)}
                                        >
                                            Eliminar
                                        </Button>
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            )}
        </Box>
    );

    // Diálogo de confirmación para eliminar
    const renderDeleteDialog = () => (
        <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogContent>
                <Typography>¿Estás seguro de que deseas eliminar este usuario?</Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setOpenDeleteDialog(false)}>Cancelar</Button>
                <Button 
                    onClick={handleDeleteConfirm} 
                    color="error"
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                    disabled={loading}
                >
                    Eliminar
                </Button>
            </DialogActions>
        </Dialog>
    );

    // Render principal
    return (
        <>
            {mode === 'list' && renderList()}
            {(mode === 'create' || mode === 'edit') && renderForm()}
            {mode === 'view' && renderView()}
            {renderDeleteDialog()}
        </>
    );
};

export default UsuarioManager;