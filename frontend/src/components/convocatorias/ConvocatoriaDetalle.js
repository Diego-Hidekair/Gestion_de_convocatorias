// frontend/src/components/convocatorias/ConvocatoriaDetalle.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {Container, Typography, Box, Card, CardContent, Grid, Button, Chip, Divider, List, ListItem, ListItemText, Alert, CircularProgress, Tab, Tabs, Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar} from '@mui/material';
import {Edit, ArrowBack, Download, Visibility, Description, Close} from '@mui/icons-material';
import { format } from 'date-fns';
import api from '../../config/axiosConfig'

const ConvocatoriaDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [convocatoria, setConvocatoria] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [pdfUrl, setPdfUrl] = useState('');
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userResponse = await api.get('/usuarios/me');
        setUserRole(userResponse.data.rol);
        const convResponse = await api.get(`/convocatorias/${id}`);
        setConvocatoria(convResponse.data);
        setError(null);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setError(error.response?.data?.error || 'Error al cargar la convocatoria');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleViewPdf = async () => {
    try {
      const response = await api.get(`/pdf/combinado/ver/${id}`, {
        responseType: 'blob'
      });
      
      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setPdfUrl(pdfUrl);
      setPdfModalOpen(true);
    } catch (error) {
      console.error('Error al obtener el PDF:', error);
      setSnackbarMessage('Error al cargar el PDF');
      setSnackbarOpen(true);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      const response = await api.get(`/pdf/download/${id}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `convocatoria_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      
      setSnackbarMessage('Descarga iniciada');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      setSnackbarMessage('Error al descargar el PDF');
      setSnackbarOpen(true);
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Para Revisión': return 'default';
      case 'En Revisión': return 'info';
      case 'Observado': return 'warning';
      case 'Revisado': return 'primary';
      case 'Aprobado': return 'success';
      case 'Devuelto': return 'error';
      case 'Para Publicar': return 'secondary';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={() => navigate('/convocatorias')}
          sx={{ mt: 2 }}
        >
          Volver a la lista
        </Button>
      </Container>
    );
  }

  const handleVerDocumento = (tipo) => {
  const base = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
  window.open(`${base}/convocatorias-archivos/${id}/ver-pdf/${tipo}`, '_blank');
};

const handleDescargarDocumento = (tipo) => {
  const base = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
  window.open(`${base}/convocatorias-archivos/${id}/descargar/${tipo}`, '_blank');
};

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={() => navigate('/convocatorias')}
        >
          Volver
        </Button>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={() => navigate(`/convocatorias/edit/${id}`)}
          >
            Editar
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<Description />}
            onClick={handleViewPdf}
          >
            Ver PDF
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleDownloadPdf}
          >
            Descargar
          </Button>
        </Box>
      </Box>
      
      <Typography variant="h4" gutterBottom>
        {convocatoria.nombre_conv}
      </Typography>
      
      <Chip 
        label={convocatoria.estado} 
        color={getEstadoColor(convocatoria.estado)} 
        sx={{ mb: 3 }}
      />
      
      {convocatoria.comentario_observado && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Comentario/Observación:
          </Typography>
          {convocatoria.comentario_observado}
        </Alert>
      )}
      
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Información General" />
          <Tab label="Materias" />
          <Tab label="Documentos" />
        </Tabs>
      </Paper>
      
      {activeTab === 0 && (
        <Card>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Detalles de la Convocatoria
                </Typography>
                
                <List>
                  <ListItem>
                    <ListItemText 
                      primary="Programa" 
                      secondary={convocatoria.nombre_programa || 'N/A'} 
                    />
                  </ListItem>
                  <Divider component="li" />
                  
                  <ListItem>
                    <ListItemText 
                      primary="Facultad" 
                      secondary={convocatoria.nombre_facultad || 'N/A'} 
                    />
                  </ListItem>
                  <Divider component="li" />
                  
                  <ListItem>
                    <ListItemText 
                      primary="Tipo de Jornada" 
                      secondary={convocatoria.tipo_jornada || 'N/A'} 
                    />
                  </ListItem>
                  <Divider component="li" />
                  
                  <ListItem>
                    <ListItemText 
                      primary="Etapa" 
                      secondary={convocatoria.etapa_convocatoria || 'N/A'} 
                    />
                  </ListItem>
                  <Divider component="li" />
                  
                  <ListItem>
                    <ListItemText 
                      primary="Gestión" 
                      secondary={convocatoria.gestion || 'N/A'} 
                    />
                  </ListItem>
                </List>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Fechas y Documentos
                </Typography>
                
                <List>
                  <ListItem>
                    <ListItemText 
                      primary="Fecha de Inicio" 
                      secondary={format(new Date(convocatoria.fecha_inicio), 'dd/MM/yyyy')} 
                    />
                  </ListItem>
                  <Divider component="li" />
                  
                  <ListItem>
                    <ListItemText 
                      primary="Fecha de Fin" 
                      secondary={convocatoria.fecha_fin ? format(new Date(convocatoria.fecha_fin), 'dd/MM/yyyy') : 'N/A'} 
                    />
                  </ListItem>
                  <Divider component="li" />
                  
                  <ListItem>
                    <ListItemText 
                      primary="Resolución" 
                      secondary={convocatoria.resolucion || 'N/A'} 
                    />
                  </ListItem>
                  <Divider component="li" />
                  
                  <ListItem>
                    <ListItemText 
                      primary="Dictamen" 
                      secondary={convocatoria.dictamen || 'N/A'} 
                    />
                  </ListItem>
                  <Divider component="li" />
                  
                  <ListItem>
                    <ListItemText 
                      primary="Pago Mensual" 
                      secondary={convocatoria.pago_mensual ? `Bs. ${convocatoria.pago_mensual}` : 'N/A'} 
                    />
                  </ListItem>
                </List>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Perfil Profesional
                </Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  {convocatoria.perfil_profesional || 'No especificado'}
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
      
      {activeTab === 1 && (
        <Card>
          <CardContent>
            {convocatoria.materias && convocatoria.materias.length > 0 ? (
              <List>
                {convocatoria.materias.map((materia, index) => (
                  <React.Fragment key={materia.id_materia}>
                    <ListItem>
                      <ListItemText
                        primary={`${materia.cod_materia} - ${materia.materia}`}
                        secondary={
                          `Horas: Teoría ${materia.horas_teoria}, Práctica ${materia.horas_practica}, ` +
                          `Laboratorio ${materia.horas_laboratorio} | Total: ${materia.total_horas} horas`
                        }
                      />
                    </ListItem>
                    {index < convocatoria.materias.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Alert severity="info">
                No se han asignado materias a esta convocatoria
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
      
      {activeTab === 2 && (
        <Card>
          <CardContent>
            {convocatoria.archivos ? (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Description fontSize="large" />
                    <Typography variant="subtitle1">Documento de Convocatoria</Typography>
                    <Button 
                      size="small" 
                      startIcon={<Visibility />}
                      onClick={() => {/* Lógica para ver este documento */}}
                    >
                      Ver
                    </Button>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
  <Paper sx={{ p: 2, textAlign: 'center' }}>
    <Description fontSize="large" />
    <Typography variant="subtitle1">Resolución</Typography>
    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
      <Button 
  size="small"
  startIcon={<Visibility />}
  disabled={!convocatoria.archivos.resolucion}
  onClick={() => handleVerDocumento('resolucion')}
>
         Ver
</Button>
<Button 
  size="small"
  startIcon={<Download />}
  disabled={!convocatoria.archivos.resolucion}
  onClick={() => handleDescargarDocumento('resolucion')}
>
  Descargar
</Button>
    </Box>
  </Paper>
</Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Description fontSize="large" />
                    <Typography variant="subtitle1">Dictamen</Typography>
                    <Button 
                      size="small" 
                      startIcon={<Visibility />}
                      disabled={!convocatoria.archivos.dictamen}
                    >
                      {convocatoria.archivos.dictamen ? 'Ver' : 'No disponible'}
                    </Button>
                  </Paper>
                </Grid>
              </Grid>
            ) : (
              <Alert severity="info">
                No se han cargado documentos adicionales para esta convocatoria
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
      
      <Dialog 
        open={pdfModalOpen} 
        onClose={() => setPdfModalOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Vista previa del documento
          <IconButton
            aria-label="close"
            onClick={() => setPdfModalOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ minHeight: '80vh' }}>
          {pdfUrl && (
            <iframe 
              src={pdfUrl} 
              width="100%" 
              height="600px" 
              style={{ border: 'none' }}
              title="Documento de convocatoria"
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPdfModalOpen(false)}>Cerrar</Button>
          <Button 
            onClick={handleDownloadPdf}
            startIcon={<Download />}
            variant="contained"
          >
            Descargar
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity="info"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ConvocatoriaDetalle;
