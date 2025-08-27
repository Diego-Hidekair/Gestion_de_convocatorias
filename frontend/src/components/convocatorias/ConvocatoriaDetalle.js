// frontend/src/components/convocatorias/ConvocatoriaDetalle.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Card, CardContent, Grid, Button, Chip, Divider, List, ListItem, ListItemText, Alert, CircularProgress, Tab, Tabs, Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar } from '@mui/material';
import { Edit, ArrowBack, Download, Visibility, Description, Close } from '@mui/icons-material';
import { format } from 'date-fns';
import api from '../../config/axiosConfig';

const ConvocatoriaDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [convocatoria, setConvocatoria] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  //const [pdfUrl, setPdfUrl] = useState('');
  //const [pdfModalOpen, setPdfModalOpen] = useState(false);
  
  const [documentoModal, setDocumentoModal] = useState({
  abierto: false,
  url: null,
  titulo: ''
});
  
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Obtener datos del usuario
        const userResponse = await api.get('/usuarios/me');
        setUserRole(userResponse.data.rol);
        
        // Obtener datos de la convocatoria
        const convResponse = await api.get(`/convocatorias/${id}`);
        setConvocatoria(convResponse.data);
        
        setError(null);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setError(error.message || 'Error al cargar la convocatoria');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleViewDocument = async (tipo = null) => {
  try {
    const endpoint = tipo 
      ? `/convocatorias-archivos/${id}/ver-pdf/${tipo}`
      : `/convocatorias-archivos/${id}/ver`;

    const response = await api.get(endpoint, { responseType: 'blob' });
    const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));

    setDocumentoModal({
      abierto: true,
      url: url,
      titulo: tipo ? 
        `Documento: ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}` : 
        'Documento de Convocatoria'
    });

  } catch (error) {
    console.error('Error al visualizar documento:', error);
    setSnackbarMessage(`Error al visualizar el documento${tipo ? ` (${tipo})` : ''}`);
    setSnackbarOpen(true);
  }
};

  const handleDownloadDocument = async (tipo = null) => {
    try {
      const endpoint = tipo
        ? `/convocatorias-archivos/${id}/descargar/${tipo}`
        : `/convocatorias-archivos/${id}/ver`;
      
      const filename = tipo ? `${tipo}_${id}.pdf` : `convocatoria_${id}.pdf`;

      const response = await api.get(endpoint, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSnackbarMessage(`Descarga de ${tipo || 'convocatoria'} iniciada`);
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error al descargar documento:', error);
      setSnackbarMessage(`Error al descargar el documento${tipo ? ` (${tipo})` : ''}`);
      setSnackbarOpen(true);
    }
  };


  const getAuthToken = () => {
    return localStorage.getItem('token'); 
  };
  
  const formatFecha = (fecha) => {
  if (!fecha) return 'N/A';
  const date = new Date(fecha);
  return isNaN(date.getTime()) ? 'N/A' : format(date, 'dd/MM/yyyy');
};

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
 

  const handleDownloadPdf = async () => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/convocatorias-archivos/${id}/ver`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }); 
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `convocatoria_${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={() => navigate('/convocatorias')}
        >
          Volver
        </Button>
        
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
                      secondary={formatFecha(convocatoria.fecha_inicio)} 
                    />
                  </ListItem>
                  <Divider component="li" />
                  
                 <ListItem>
                    <ListItemText 
                      primary="Fecha de Fin" 
                      secondary={formatFecha(convocatoria.fecha_fin)} 
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
          {/* Documento de Convocatoria */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Description fontSize="large" />
              <Typography variant="subtitle1">Documento de Convocatoria</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                <Button 
                  size="small"
                  startIcon={<Visibility />}
                  disabled={!convocatoria.archivos.doc_conv}
                  onClick={() => handleViewDocument()}
                >
                  Ver
                </Button>
                <Button 
                  size="small"
                  startIcon={<Download />}
                  disabled={!convocatoria.archivos.doc_conv}
                  onClick={() => handleDownloadDocument()}
                >
                  Descargar
                </Button>
              </Box>
            </Paper>
          </Grid>
                
                {/* Resolución */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Description fontSize="large" />
              <Typography variant="subtitle1">Resolución</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                <Button 
                  size="small"
                  startIcon={<Visibility />}
                  disabled={!convocatoria.archivos.resolucion}
                  onClick={() => handleViewDocument('resolucion')}
                >
                  Ver
                </Button>
                <Button 
                  size="small"
                  startIcon={<Download />}
                  disabled={!convocatoria.archivos.resolucion}
                  onClick={() => handleDownloadDocument('resolucion')}
                >
                  Descargar
                </Button>
              </Box>
            </Paper>
          </Grid>
                
                {/* Dictamen */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Description fontSize="large" />
              <Typography variant="subtitle1">Dictamen</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                <Button 
                  size="small"
                  startIcon={<Visibility />}
                  disabled={!convocatoria.archivos.dictamen}
                  onClick={() => handleViewDocument('dictamen')}
                >
                  Ver
                </Button>
                <Button 
                  size="small"
                  startIcon={<Download />}
                  disabled={!convocatoria.archivos.dictamen}
                  onClick={() => handleDownloadDocument('dictamen')}
                >
                  Descargar
                </Button>
              </Box>
            </Paper>
          </Grid>
                
                {/* Carta */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Description fontSize="large" />
              <Typography variant="subtitle1">Carta</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                <Button 
                  size="small"
                  startIcon={<Visibility />}
                  disabled={!convocatoria.archivos.carta}
                  onClick={() => handleViewDocument('carta')}
                >
                  Ver
                </Button>
                <Button 
                  size="small"
                  startIcon={<Download />}
                  disabled={!convocatoria.archivos.carta}
                  onClick={() => handleDownloadDocument('carta')}
                >
                  Descargar
                </Button>
              </Box>
            </Paper>
          </Grid>
                
                {/* Nota */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Description fontSize="large" />
              <Typography variant="subtitle1">Nota</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                <Button 
                  size="small"
                  startIcon={<Visibility />}
                  disabled={!convocatoria.archivos.nota}
                  onClick={() => handleViewDocument('nota')}
                >
                  Ver
                </Button>
                <Button 
                  size="small"
                  startIcon={<Download />}
                  disabled={!convocatoria.archivos.nota}
                  onClick={() => handleDownloadDocument('nota')}
                >
                  Descargar
                </Button>
              </Box>
            </Paper>
          </Grid>
                
                {/* Certificado Item */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Description fontSize="large" />
              <Typography variant="subtitle1">Certificado Item</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                <Button 
                  size="small"
                  startIcon={<Visibility />}
                  disabled={!convocatoria.archivos.certificado_item}
                  onClick={() => handleViewDocument('certificado_item')}
                >
                  Ver
                </Button>
                <Button 
                  size="small"
                  startIcon={<Download />}
                  disabled={!convocatoria.archivos.certificado_item}
                  onClick={() => handleDownloadDocument('certificado_item')}
                >
                  Descargar
                </Button>
              </Box>
            </Paper>
          </Grid>
                
                {/* Certificado Presupuestario */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Description fontSize="large" />
              <Typography variant="subtitle1">Certificado Presupuestario</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                <Button 
                  size="small"
                  startIcon={<Visibility />}
                  disabled={!convocatoria.archivos.certificado_presupuestario}
                  onClick={() => handleViewDocument('certificado_presupuestario')}
                >
                  Ver
                </Button>
                <Button 
                  size="small"
                  startIcon={<Download />}
                  disabled={!convocatoria.archivos.certificado_presupuestario}
                  onClick={() => handleDownloadDocument('certificado_presupuestario')}
                >
                  Descargar
                </Button>
              </Box>
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
  open={documentoModal.abierto} 
  onClose={() => setDocumentoModal({...documentoModal, abierto: false})}
  maxWidth="lg"
  fullWidth
>
        <DialogTitle>
    {documentoModal.titulo}
    <IconButton
      aria-label="close"
      onClick={() => setDocumentoModal({...documentoModal, abierto: false})}
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
    {documentoModal.url && (
      <iframe 
        src={documentoModal.url} 
        width="100%" 
        height="600px" 
        style={{ border: 'none' }}
        title={documentoModal.titulo}
      />
    )}
        </DialogContent>
  <DialogActions>
    <Button onClick={() => setDocumentoModal({...documentoModal, abierto: false})}>
      Cerrar
    </Button>
    <Button 
      onClick={() => {
        const tipo = documentoModal.titulo.includes('Convocatoria') ? null : 
          documentoModal.titulo.split(': ')[1].toLowerCase();
        handleDownloadDocument(tipo);
      }}
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