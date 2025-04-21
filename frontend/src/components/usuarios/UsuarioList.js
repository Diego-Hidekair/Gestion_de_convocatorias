// src/components/usuarios/UsuarioList.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Card, CardContent, Typography,Grid, CircularProgress, Alert, Pagination } from '@mui/material';
import {  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import useUsuarios from './hooks/useUsuarios';

const UsuarioList = () => {
  const navigate = useNavigate();
  const { 
    usuarios, 
    loading, 
    error, 
    pagination,
    fetchUsuarios, 
    deleteUsuario 
  } = useUsuarios();

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handlePageChange = (event, newPage) => {
    fetchUsuarios(newPage, pagination.limit);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      await deleteUsuario(id);
      fetchUsuarios(pagination.page, pagination.limit);
    }
  };

  if (loading && usuarios.length === 0) return <CircularProgress />;
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
                {usuario.nombre_programa && (
                  <Typography>Programa: {usuario.nombre_programa}</Typography>
                )}
                
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

      {usuarios.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={Math.ceil(pagination.total / pagination.limit)}
            page={pagination.page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
};

export default UsuarioList;