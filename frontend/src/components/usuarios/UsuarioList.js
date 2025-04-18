// frontend/src/components/usuarios/UsuarioList.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUsuarios } from './hooks/useUsuarios';
import { Box, Button, Card, CardContent, Typography, Grid, CircularProgress, Alert } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Visibility as VisibilityIcon } from '@mui/icons-material';

const UsuarioList = () => {
  const navigate = useNavigate();
  const { usuarios, loading, error, deleteUsuario } = useUsuarios();

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      await deleteUsuario(id);
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Lista de Usuarios</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => navigate('/usuarios/new')}
        >
          Nuevo Usuario
        </Button>
      </Box>

      <Grid container spacing={3}>
        {usuarios.map((usuario) => (
          <Grid item xs={12} sm={6} md={4} key={usuario.id_usuario}>
            <Card>
              <CardContent>
                <Typography variant="h6">
                  {usuario.nombres} {usuario.apellido_paterno}
                </Typography>
                <Typography color="text.secondary">ID: {usuario.id_usuario}</Typography>
                <Typography>Rol: {usuario.rol}</Typography>
                <Typography>Celular: {usuario.celular}</Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button 
                    size="small" 
                    startIcon={<VisibilityIcon />}
                    onClick={() => navigate(`/usuarios/view/${usuario.id_usuario}`)}
                  >
                    Ver
                  </Button>
                  <Button 
                    size="small" 
                    startIcon={<EditIcon />}
                    onClick={() => navigate(`/usuarios/edit/${usuario.id_usuario}`)}
                    sx={{ ml: 1 }}
                  >
                    Editar
                  </Button>
                  <Button 
                    size="small" 
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDelete(usuario.id_usuario)}
                    sx={{ ml: 1 }}
                    color="error"
                  >
                    Eliminar
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default UsuarioList;