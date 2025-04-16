// frontend/src/components/usuarios/UsuarioPerfil.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, Card, CardContent, Avatar, Button, CircularProgress, Alert, Divider, Chip } from '@mui/material';
import { Edit as EditIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';

const UsuarioView = ({ isCurrentUser = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        setLoading(true);
        const endpoint = isCurrentUser ? 'me' : id;
        const response = await axios.get(`/usuarios/${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        const rolesDescriptivos = {
          'admin': 'Administrador',
          'personal_administrativo': 'Personal Administrativo',
          'secretaria_de_decanatura': 'Secretaría de Decanatura',
          'tecnico_vicerrectorado': 'Técnico de Vicerrectorado',
          'vicerrectorado': 'Vicerrectorado'
        };
        
        setUsuario({
          ...response.data,
          rolDescriptivo: rolesDescriptivos[response.data.rol] || response.data.rol
        });
      } catch (err) {
        setError(err.response?.data?.error || 'Error al cargar el usuario');
        console.error('Error fetching usuario:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsuario();
  }, [id, isCurrentUser]);

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
      <CircularProgress />
    </Box>
  );

  if (error) return (
    <Box sx={{ p: 3 }}>
      <Alert severity="error">{error}</Alert>
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate('/usuarios')}
        sx={{ mt: 2 }}
      >
        Volver a la lista
      </Button>
    </Box>
  );

  if (!usuario) return (
    <Box sx={{ p: 3 }}>
      <Alert severity="warning">Usuario no encontrado</Alert>
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate('/usuarios')}
        sx={{ mt: 2 }}
      >
        Volver a la lista
      </Button>
    </Box>
  );

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/usuarios')}
          variant="outlined"
        >
          Volver
        </Button>
        <Typography variant="h4" sx={{ ml: 2 }}>
          Perfil de Usuario
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Avatar 
                src={usuario.foto_perfil ? `data:image/jpeg;base64,${usuario.foto_perfil}` : '/default-avatar.png'}
                sx={{ width: 150, height: 150 }}
              />
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" gutterBottom>
                {usuario.nombres} {usuario.apellido_paterno} {usuario.apellido_materno}
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Chip label={`ID: ${usuario.id_usuario}`} color="primary" sx={{ mr: 1 }} />
                <Chip label={`Rol: ${usuario.rolDescriptivo}`} color="secondary" />
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <Box>
                  <Typography><strong>Celular:</strong> {usuario.celular || 'No registrado'}</Typography>
                  {usuario.nombre_facultad && (
                    <Typography sx={{ mt: 1 }}>
                      <strong>Facultad:</strong> {usuario.nombre_facultad}
                    </Typography>
                  )}
                </Box>
                <Box>
                  {usuario.nombre_carrera && (
                    <>
                      <Typography><strong>Carrera:</strong> {usuario.nombre_carrera}</Typography>
                    </>
                  )}
                </Box>
              </Box>
              
              {!isCurrentUser && (
                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={() => navigate(`/usuarios/edit/${id}`)}
                    sx={{ mr: 2 }}
                  >
                    Editar
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default UsuarioView;