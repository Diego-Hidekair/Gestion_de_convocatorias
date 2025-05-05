// frontend/src/components/Convocatoria/ViewConvocatoria.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Paper, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Chip, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';
import useAuth from '../../hooks/useAuth';
import PDFViewer from './PDFViewer';

const ViewConvocatoria = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [convocatoria, setConvocatoria] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [pdfUrl, setPdfUrl] = useState('');

  useEffect(() => {
    const fetchConvocatoria = async () => {
      try {
        const response = await axios.get(`/convocatorias/${id}`);
        setConvocatoria(response.data);
        
        if (response.data.archivos?.doc_conv) {
          const pdfBlob = new Blob([response.data.archivos.doc_conv], { type: 'application/pdf' });
          setPdfUrl(URL.createObjectURL(pdfBlob));
        }
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchConvocatoria();
  }, [id]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleDownloadPDF = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `convocatoria_${id}.pdf`;
    link.click();
  };

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" my={5}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Box my={3}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Box my={3}>
        <Typography variant="h4" gutterBottom>
          {convocatoria.nombre_conv}
        </Typography>
        
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Chip 
            label={convocatoria.estado} 
            color={
              convocatoria.estado === 'Aprobado' ? 'success' : 
              convocatoria.estado === 'Observado' || convocatoria.estado === 'Devuelto' ? 'error' : 
              'primary'
            } 
            size="medium"
          />
          
          <Box>
            {user.rol === 'secretaria_de_decanatura' && convocatoria.estado === 'Observado' && (
              <Button 
                variant="contained" 
                color="secondary"
                onClick={() => navigate(`/convocatorias/${id}/editar`)}
                style={{ marginRight: '8px' }}
              >
                Editar Convocatoria
              </Button>
            )}
            
            {pdfUrl && (
              <Button variant="contained" color="primary" onClick={handleDownloadPDF}>
                Descargar PDF
              </Button>
            )}
          </Box>
        </Box>
        
        {convocatoria.comentario_observado && (
          <Alert severity="warning" style={{ marginBottom: '16px' }}>
            <strong>Comentario/Observación:</strong> {convocatoria.comentario_observado}
          </Alert>
        )}
      </Box>

      <Paper elevation={3} style={{ padding: '16px', marginBottom: '24px' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="convocatoria tabs">
          <Tab label="Información General" />
          <Tab label="Materias" />
          <Tab label="Documentos" />
        </Tabs>
        
        {tabValue === 0 && (
          <Box mt={3}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Tipo de Convocatoria:</strong> {convocatoria.nombre_tipo_conv}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Programa:</strong> {convocatoria.programa}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Facultad:</strong> {convocatoria.facultad}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Gestión:</strong> {convocatoria.gestion}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Fecha Inicio:</strong> {new Date(convocatoria.fecha_inicio).toLocaleDateString()}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Fecha Fin:</strong> {new Date(convocatoria.fecha_fin).toLocaleDateString()}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Tipo de Jornada:</strong> {convocatoria.tipo_jornada}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Pago Mensual:</strong> Bs. {convocatoria.pago_mensual}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Perfil Profesional:</strong>
                </Typography>
                <Typography paragraph>
                  {convocatoria.perfil_profesional}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )}
        
        {tabValue === 1 && (
          <Box mt={3}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Código</TableCell>
                    <TableCell>Materia</TableCell>
                    <TableCell>Horas Teoría</TableCell>
                    <TableCell>Horas Práctica</TableCell>
                    <TableCell>Horas Laboratorio</TableCell>
                    <TableCell>Total Horas</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {convocatoria.materias.map((materia) => (
                    <TableRow key={materia.id_materia}>
                      <TableCell>{materia.cod_materia}</TableCell>
                      <TableCell>{materia.materia}</TableCell>
                      <TableCell>{materia.horas_teoria}</TableCell>
                      <TableCell>{materia.horas_practica}</TableCell>
                      <TableCell>{materia.horas_laboratorio}</TableCell>
                      <TableCell>{materia.total_horas}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
        
        {tabValue === 2 && (
          <Box mt={3}>
            {pdfUrl ? (
              <PDFViewer pdfUrl={pdfUrl} />
            ) : (
              <Typography>No hay documentos disponibles</Typography>
            )}
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default ViewConvocatoria;