// frontend/src/components/convocatorias/ConvocatoriaList.js
import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, FormControl, InputLabel, Select, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions, Alert, Snackbar, Chip, Badge, Tooltip} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Menu, MenuItem, ListItemIcon } from '@mui/material';
import { Edit, Delete, Visibility, Download, Comment, Add, Search, Refresh, CheckCircle as CheckCircleIcon, Warning as WarningIcon, Error as ErrorIcon, Info as InfoIcon, Autorenew as AutorenewIcon, Send as SendIcon, ArrowDropDown as ArrowDropDownIcon} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import api from '../../config/axiosConfig'

const ConvocatoriaList = () => {
  const navigate = useNavigate();
///  const theme = useTheme();

  const [convocatorias, setConvocatorias] = useState([]);
  const [filteredConvocatorias, setFilteredConvocatorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('nombre_conv');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [convocatoriaToDelete, setConvocatoriaToDelete] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [userRole, setUserRole] = useState('');
  const [estadoDialogOpen, setEstadoDialogOpen] = useState(false);
  const [selectedEstado, setSelectedEstado] = useState('');
  const [selectedConvocatoria, setSelectedConvocatoria] = useState(null);
  const [comentario, setComentario] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentConvocatoria, setCurrentConvocatoria] = useState(null);
  const [validating, setValidating] = useState(false);
    
  const theme = useTheme();
  // Campos de búsqueda disponibles
  const searchFields = [
    { value: 'nombre_conv', label: 'Nombre' },
    { value: 'nombre_programa', label: 'Programa' },
    { value: 'nombre_facultad', label: 'Facultad' },
    { value: 'estado', label: 'Estado' }
  ];
  const handleOpenEstadoMenu = (event, convocatoria) => { setAnchorEl(event.currentTarget); setCurrentConvocatoria(convocatoria); };
  const handleCloseEstadoMenu = () => { setAnchorEl(null); setCurrentConvocatoria(null); };
  useEffect(() => {
    const fetchUserRole = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await api.get('/usuarios/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUserRole(response.data.rol);
            
            if (response.data.rol === 'personal_administrativo') {
                document.title = "Convocatorias Aprobadas";
            }
        } catch (error) {
            console.error('Error al obtener el rol del usuario:', error);
        }
    };

    fetchUserRole();
    fetchConvocatorias();
}, []);

  const fetchConvocatorias = async () => {
    try {
      setLoading(true);
      const response = await api.get('/convocatorias');
      setConvocatorias(response.data);
      setFilteredConvocatorias(response.data);
      setError(null);
    } catch (error) {
      console.error('Error al obtener convocatorias:', error);
      setError(error.response?.data?.error || 'Error al cargar convocatorias');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredConvocatorias(convocatorias);
    } else {
      const filtered = convocatorias.filter(conv => 
        String(conv[searchField]).toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredConvocatorias(filtered);
    }
  }, [searchTerm, searchField, convocatorias]);

  const handleDeleteClick = (id) => {
    setConvocatoriaToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/convocatorias/${convocatoriaToDelete}`);
      setConvocatorias(convocatorias.filter(c => c.id_convocatoria !== convocatoriaToDelete));
      showSnackbar('Convocatoria eliminada correctamente', 'success');
    } catch (error) {
      console.error('Error al eliminar convocatoria:', error);
      showSnackbar('Error al eliminar convocatoria', 'error');
    } finally {
      setDeleteDialogOpen(false);
      setConvocatoriaToDelete(null);
    }
  };

  const handleEstadoChangeClick = async (convocatoria, nuevoEstado) => {
  if (!convocatoria?.id_convocatoria) {
    console.error('Convocatoria inválida:', convocatoria);
    showSnackbar('No se ha seleccionado una convocatoria válida', 'error');
    return;
  }
  
  const convocatoriaSeleccionada = {...convocatoria};
  
    if (['Observado', 'Devuelto'].includes(nuevoEstado)) {
      setSelectedConvocatoria(convocatoriaSeleccionada);
      setSelectedEstado(nuevoEstado);
      setEstadoDialogOpen(true);
    } else {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No hay token de autenticación');

        const payload = { estado: nuevoEstado };
        
        const response = await api.patch(
          `/convocatorias/${convocatoriaSeleccionada.id_convocatoria}/estado`,
          payload,
          { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
        );

        const updatedConvocatorias = convocatorias.map(conv => 
          conv.id_convocatoria === convocatoriaSeleccionada.id_convocatoria 
            ? { ...conv, ...response.data }
            : conv
        );
        
        setConvocatorias(updatedConvocatorias);
        showSnackbar(`Estado cambiado a "${nuevoEstado}"`, 'success');
      } catch (error) {
        console.error('Error al cambiar estado:', error);
        showSnackbar(error.response?.data?.error || error.message || 'Error al cambiar estado', 'error');
      }
    }
  };
  
  const handleEditComentario = (convocatoria) => {
    setSelectedConvocatoria(convocatoria);
    setComentario(convocatoria.comentario_observado || '');
    setSelectedEstado(convocatoria.estado); 
    setEstadoDialogOpen(true);
  };

  const handleDownloadPdf = async (id) => {
  try {
    const response = await api.get(`/pdf/${id}/descargar`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `convocatoria_${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  } catch (error) {
    console.error('Error al descargar PDF:', error);
    showSnackbar('Error al descargar PDF', 'error');
  }
};

  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Para Revisión': return 'warning'; 
      case 'En Revisión': return 'info';     
      case 'Observado': return 'error';      
      case 'Revisado': return 'success';    
      case 'Aprobado': return 'success';     
      case 'Devuelto': return 'error';       
      case 'Para Publicar': return 'secondary';
      default: return 'default';
    }
  };

  const handleValidarAprobadas = async () => {
    try {
        setValidating(true);
        const token = localStorage.getItem('token');
        
        const response = await api.post(
            '/convocatorias/validar-aprobadas',
            {},
            { headers: { Authorization: `Bearer ${token}` } }
        );
        
        showSnackbar(response.data.message, 'success');
        fetchConvocatorias();
    } catch (error) {
        console.error('Error al validar convocatorias:', error);
        showSnackbar(error.response?.data?.error || 'Error al validar convocatorias', 'error');
    } finally {
        setValidating(false);
    }
};

  const renderEstadoActions = (convocatoria) => {
  const estadosPermitidos = getEstadosPermitidos();
  
  if (estadosPermitidos.length === 0 || !['tecnico_vicerrectorado', 'vicerrectorado'].includes(userRole)) {
    return (
      <Chip 
        label={convocatoria.estado} 
        color={getEstadoColor(convocatoria.estado)} 
        size="small"
        clickable={false}
      />
    );
  }
  return (
    <>
      <Tooltip title="Haz clic para cambiar el estado">
        <Chip
          label={convocatoria.estado}
          color={getEstadoColor(convocatoria.estado)}
          size="small"
          onClick={(e) => handleOpenEstadoMenu(e, convocatoria)}
          clickable
          deleteIcon={<ArrowDropDownIcon />}
          onDelete={(e) => handleOpenEstadoMenu(e, convocatoria)}
        />
      </Tooltip>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseEstadoMenu}
        PaperProps={{
          sx: {
            minWidth: 200,
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.15)'
          }
        }}
      >
        <MenuItem disabled sx={{ fontWeight: 'bold', opacity: 1 }}>
          <ListItemIcon>
            <AutorenewIcon color="disabled" />
          </ListItemIcon>
          Cambiar estado a:
        </MenuItem>
        
        {estadosPermitidos.map((estado) => (
          <MenuItem
            key={estado.value}
            onClick={() => {
              handleCloseEstadoMenu();
              handleEstadoChangeClick(currentConvocatoria, estado.value);
            }}
            disabled={currentConvocatoria?.estado === estado.value}
            sx={{
              color: getEstadoColor(estado.value) === 'error' ? 
                theme.palette.error.main : 
                theme.palette[getEstadoColor(estado.value)]?.main,
              '&.Mui-disabled': {
                opacity: 0.5,
                backgroundColor: 'action.selected'
              }
            }}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>
              {estado.icon}
            </ListItemIcon>
            {estado.label}
            {currentConvocatoria?.estado === estado.value && (
              <Box sx={{ flexGrow: 1, textAlign: 'right' }}>
                <CheckCircleIcon fontSize="small" color="inherit" />
              </Box>
            )}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

const confirmEstadoChange = async () => {
  try {
    if (!selectedConvocatoria?.id_convocatoria || !selectedEstado) {
      throw new Error('Datos incompletos para el cambio de estado');
    }

    const token = localStorage.getItem('token');
    if (!token) throw new Error('No hay token de autenticación');

    const payload = { 
      estado: selectedEstado,
      comentario_observado: comentario 
    };

    const response = await api.patch(
      `/convocatorias/${selectedConvocatoria.id_convocatoria}/estado`,
      payload,
      { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );

    const updatedConvocatorias = convocatorias.map(conv => 
      conv.id_convocatoria === selectedConvocatoria.id_convocatoria 
        ? { ...conv, ...response.data }
        : conv
    );
    
    setConvocatorias(updatedConvocatorias);
    showSnackbar(`Estado cambiado a "${selectedEstado}"`, 'success');
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    showSnackbar(error.response?.data?.error || error.message || 'Error al cambiar estado', 'error');
  } finally {
    setEstadoDialogOpen(false);
    setSelectedConvocatoria(null);
    setSelectedEstado('');
    setComentario('');
  }
};

  const getEstadosPermitidos = () => {
    if (!userRole) return [];
    
    if (userRole === 'tecnico_vicerrectorado') {
        return [
            { value: 'En Revisión', label: 'En Revisión', icon: <AutorenewIcon /> },
            { value: 'Revisado', label: 'Revisado', icon: <CheckCircleIcon /> },
            { value: 'Observado', label: 'Observado', icon: <WarningIcon /> }
        ];
    } else if (userRole === 'vicerrectorado') {
        return [
            { value: 'Aprobado', label: 'Aprobado', icon: <CheckCircleIcon /> },
            { value: 'Devuelto', label: 'Devuelto', icon: <ErrorIcon /> }
        ];
    }
    return [];
};

{userRole === 'vicerrectorado' && (
    <Button
        variant="contained"
        color="secondary"
        startIcon={<CheckCircleIcon />}
        onClick={handleValidarAprobadas}
        disabled={validating}
        sx={{ ml: 2 }}
    >
        {validating ? 'Validando...' : 'Validar Aprobadas'}
    </Button>
)}

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
          {userRole === 'personal_administrativo' ? 'Convocatorias Aprobadas' : 'Lista de Convocatorias'}
      </Typography> 
      {/* Barra de búsqueda y acciones */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="Buscar"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search color="action" sx={{ mr: 1 }} />,
            }}
          />
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Buscar por</InputLabel>
            <Select
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
              label="Buscar por"
            >
              {searchFields.map((field) => (
                <MenuItem key={field.value} value={field.value}>
                  {field.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        
        <Box>
          <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/convocatorias/new')}
              sx={{ mr: 2 }}
          >
              Nueva Convocatoria
          </Button>
          
          {userRole === 'vicerrectorado' && (
              <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<CheckCircleIcon />}
                  onClick={handleValidarAprobadas}
                  disabled={validating}
                  sx={{ ml: 2 }}
              >
                  {validating ? 'Validando...' : 'Validar Aprobadas'}
              </Button>
          )}
                <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchConvocatorias}
          >
              Actualizar
          </Button>
        </Box>
      </Box>
      
      {/* Tabla de convocatorias */}
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Programa</TableCell>
              <TableCell>Facultad</TableCell>
              <TableCell>Fecha Inicio</TableCell>
              <TableCell>Fecha Fin</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ color: 'error.main' }}>
                  {error}
                </TableCell>
              </TableRow>
            ) : filteredConvocatorias.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No se encontraron convocatorias
                </TableCell>
              </TableRow>
            ) : (
              filteredConvocatorias.map((convocatoria) => (
                <TableRow key={convocatoria.id_convocatoria}>
                  <TableCell>{convocatoria.nombre_conv}</TableCell>
                  <TableCell>{convocatoria.nombre_programa}</TableCell>
                  <TableCell>{convocatoria.nombre_facultad}</TableCell>
                  <TableCell>
                    {format(new Date(convocatoria.fecha_inicio), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>
                    {convocatoria.fecha_fin ? format(new Date(convocatoria.fecha_fin), 'dd/MM/yyyy') : 'N/A'}
                  </TableCell>
                  
                  <TableCell sx={{ minWidth: 200 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {renderEstadoActions(convocatoria)}
                      
                      {convocatoria.comentario_observado && (
                        <Tooltip title="Ver comentario">
                          <IconButton 
                            size="small" 
                            onClick={() => handleEditComentario(convocatoria)}
                          >
                            <Badge color="error" variant="dot">
                              <Comment fontSize="small" />
                            </Badge>
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Ver detalles">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/convocatorias/${convocatoria.id_convocatoria}`)}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/convocatorias/edit/${convocatoria.id_convocatoria}`)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Descargar PDF">
                        <IconButton
                          size="small"
                          onClick={() => handleDownloadPdf(convocatoria.id_convocatoria)}
                        >
                          <Download fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Eliminar">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteClick(convocatoria.id_convocatoria)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Diálogo para eliminar */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          ¿Está seguro que desea eliminar esta convocatoria? Esta acción no se puede deshacer.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleDeleteConfirm} color="error">Eliminar</Button>
        </DialogActions>
      </Dialog>
      
      {/* Diálogo para cambiar estado con comentario */}
      <Dialog 
        open={estadoDialogOpen} 
        onClose={() => setEstadoDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {selectedEstado === 'EDIT_COMENTARIO' ? 'Editar Comentario' : `Editar comentario (Estado: ${selectedEstado})`}
        </DialogTitle>
        <DialogContent>
          {(selectedEstado === 'Observado' || selectedEstado === 'Devuelto') && (
            <>
              <Typography variant="subtitle1" color="error" gutterBottom>
                ¡Atención! Este cambio requiere justificación
              </Typography>
              <Typography paragraph>
                Por favor ingrese los motivos por los cuales la convocatoria está siendo {selectedEstado.toLowerCase()}:
              </Typography>
            </>
          )}
          
          <TextField
            autoFocus
            margin="dense"
            label={selectedEstado === 'EDIT_COMENTARIO' ? 'Comentario' : 'Justificación'}
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            required={selectedEstado !== 'EDIT_COMENTARIO'}
            error={(selectedEstado === 'Observado' || selectedEstado === 'Devuelto') && !comentario}
            helperText={
              (selectedEstado === 'Observado' || selectedEstado === 'Devuelto') && !comentario 
                ? 'Este campo es obligatorio' 
                : ''
            }
          />
        </DialogContent>
          <DialogActions>
            <Button onClick={() => setEstadoDialogOpen(false)}>Cancelar</Button>
            <Button 
              onClick={confirmEstadoChange}
              disabled={!comentario && (selectedEstado === 'Observado' || selectedEstado === 'Devuelto')}
              color="primary"
              variant="contained"
            >
              Confirmar
            </Button>
          </DialogActions>
        </Dialog>
      
      {/* Snackbar para mensajes */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ConvocatoriaList;