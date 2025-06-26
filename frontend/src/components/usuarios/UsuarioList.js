// src/components/usuarios/UsuarioList.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Card, CardContent, Typography, Grid, CircularProgress, Alert, Pagination, Select, MenuItem, FormControl, InputLabel, Stack, TextField } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
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
  
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsuarios(1, pagination.limit, searchTerm);
  }, [searchTerm]);

  const handlePageChange = (event, newPage) => {
    fetchUsuarios(newPage, pagination.limit, searchTerm);
  };

  const handleLimitChange = (e) => {
    fetchUsuarios(1, e.target.value, searchTerm);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      const result = await deleteUsuario(id);
      if (result.success) {
        fetchUsuarios(pagination.page, pagination.limit, searchTerm);
      }
    }
  };

  if (loading && usuarios.length === 0) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h4">Lista de Usuarios</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => navigate('/usuarios/new')}
        >
          Nuevo Usuario
        </Button>
      </Box>

      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <TextField
          label="Buscar usuarios"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: 300 }}
        />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Items por página</InputLabel>
          <Select
            value={pagination.limit}
            onChange={handleLimitChange}
            label="Items por página"
          >
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={20}>20</MenuItem>
            <MenuItem value={50}>50</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      <Grid container spacing={3}>
        {usuarios.map((usuario) => (
          <Grid item xs={12} sm={6} md={4} key={usuario.id_usuario}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {usuario.nombres} {usuario.apellido_paterno} {usuario.apellido_materno}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  ID: {usuario.id_usuario}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Rol:</strong> {usuario.rol.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Typography>
              {usuario.id_programa && usuario.nombre_programa && (
                  <Typography variant="body2" gutterBottom>
                    <strong>Programa:</strong> {usuario.nombre_programa}
                  </Typography>
                )}
                {usuario.id_programa && usuario.nombre_facultad && (
                  <Typography variant="body2">
                    <strong>Facultad:</strong> {usuario.nombre_facultad}
                  </Typography>
                )}
              </CardContent>
              <CardContent>
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button 
                    size="small" 
                    startIcon={<VisibilityIcon />}
                    onClick={() => navigate(`/usuarios/${usuario.id_usuario}`)}
                  >
                    Ver
                  </Button>
                  <Button 
                    size="small" 
                    startIcon={<EditIcon />}
                    onClick={() => navigate(`/usuarios/edit/${usuario.id_usuario}`)}
                    color="primary"
                  >
                    Editar
                  </Button>
                  <Button 
                    size="small" 
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDelete(usuario.id_usuario)}
                    color="error"
                  >
                    Eliminar
                  </Button>
                </Stack>
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
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Box>
  );
};

export default UsuarioList;