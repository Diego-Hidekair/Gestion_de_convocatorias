// frontend/src/components/GenerarPDF.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Container, Typography, Button, CircularProgress, Alert, 
  Card, CardContent, Box, Grid, Paper, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Dialog, 
  DialogContent, IconButton, FormControl
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import UploadIcon from '@mui/icons-material/Upload';
import DownloadIcon from '@mui/icons-material/Download';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const GenerarPDF = () => {
  const { id_convocatoria } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [documentos, setDocumentos] = useState([]);
  const [pdfPreview, setPdfPreview] = useState(null);
  const [openPreview, setOpenPreview] = useState(false);
  const [archivos, setArchivos] = useState({
    doc_conv: null,
    resolucion: null,
    dictamen: null,
    carta: null,
    nota: null,
    certificado_item: null,
    certificado_presupuestario: null
  });

  const cargarVistaPrevia = useCallback(async () => {
    try {
      const pdfResponse = await axios.get(
        `http://localhost:5000/pdf/convocatorias/${id_convocatoria}/pdf`,
        { 
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          responseType: 'blob'
        }
      );
      setPdfPreview(URL.createObjectURL(new Blob([pdfResponse.data])));
    } catch (err) {
      console.error("Error al cargar vista previa:", err);
    }
  }, [id_convocatoria]);

  const generarPDF = useCallback(async () => {
    try {
      await axios.post(
        `http://localhost:5000/pdf/convocatorias/${id_convocatoria}/pdf/generar`, 
        {},
        { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
      );
      setSuccess('PDF generado correctamente');
      // Recargar documentos
      const response = await axios.get(
        `http://localhost:5000/convocatorias-archivos/${id_convocatoria}`,
        { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
      );
      setDocumentos(response.data);
      await cargarVistaPrevia();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al generar PDF');
    }
  }, [id_convocatoria, cargarVistaPrevia]);

  // Cargar documentos y generar PDF si es necesario
  useEffect(() => {
    const cargarDocumentos = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:5000/convocatorias-archivos/${id_convocatoria}`,
          { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
        );

        if (response.data.length === 0) {
          await generarPDF();
        } else {
          setDocumentos(response.data);
          await cargarVistaPrevia();
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Error al cargar documentos');
      } finally {
        setLoading(false);
      }
    };

    cargarDocumentos();
  }, [id_convocatoria, generarPDF, cargarVistaPrevia]);

  const handlePreviewPDF = () => setOpenPreview(true);
  const handleClosePreview = () => setOpenPreview(false);

  const handleFileChange = (e, tipo) => {
    setArchivos({
      ...archivos,
      [tipo]: e.target.files[0]
    });
  };

  const subirArchivos = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      
      Object.entries(archivos).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });

      await axios.post(
        `http://localhost:5000/convocatorias-archivos/${id_convocatoria}/archivos`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      // Actualizar lista
      const response = await axios.get(
        `http://localhost:5000/convocatorias-archivos/${id_convocatoria}`,
        { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
      );
      
      setDocumentos(response.data);
      setSuccess('Archivos subidos correctamente');
      setArchivos({
        doc_conv: null,
        resolucion: null,
        dictamen: null,
        carta: null,
        nota: null,
        certificado_item: null,
        certificado_presupuestario: null
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Error al subir archivos');
    } finally {
      setLoading(false);
    }
  };

  const descargarArchivo = async (tipo) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/convocatorias-archivos/${id_convocatoria}/archivos/${tipo.toLowerCase()}`,
        {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${tipo}_convocatoria_${id_convocatoria}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Error al descargar el archivo');
    }
  };

  const renderFileInput = (tipo, label) => (
    <Grid item xs={12} sm={6} md={4}>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => handleFileChange(e, tipo)}
          style={{ display: 'none' }}
          id={`${tipo}-input`}
        />
        <label htmlFor={`${tipo}-input`}>
          <Button 
            variant="outlined" 
            component="span" 
            fullWidth
            startIcon={<UploadIcon />}
          >
            {archivos[tipo]?.name || label}
          </Button>
        </label>
      </FormControl>
    </Grid>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Encabezado */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Gestión de Documentos - Convocatoria #{id_convocatoria}
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/convocatorias/${id_convocatoria}`)}
        >
          Volver
        </Button>
      </Box>

      {/* Alertas */}
      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>{success}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Columna izquierda: Vista previa del PDF */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <PictureAsPdfIcon color="error" sx={{ mr: 1 }} />
                  Documento Principal
                </Typography>
                
                {pdfPreview ? (
                  <>
                    <Box sx={{ 
                      height: '400px', 
                      border: '1px dashed #ccc',
                      mb: 2,
                      overflow: 'hidden'
                    }}>
                      <iframe 
                        src={pdfPreview} 
                        width="100%" 
                        height="100%" 
                        style={{ border: 'none' }}
                        title="Vista previa del PDF"
                      />
                    </Box>
                    <Button 
                      variant="contained" 
                      onClick={handlePreviewPDF}
                      fullWidth
                      startIcon={<PictureAsPdfIcon />}
                    >
                      Ampliar Vista Previa
                    </Button>
                  </>
                ) : (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    p: 4,
                    border: '1px dashed #ccc',
                    borderRadius: 1
                  }}>
                    <Typography color="textSecondary" sx={{ mb: 2 }}>
                      No hay PDF generado
                    </Typography>
                    <Button 
                      variant="outlined" 
                      onClick={generarPDF}
                      startIcon={<PictureAsPdfIcon />}
                    >
                      Generar PDF
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Columna derecha: Subida de documentos */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <UploadIcon color="primary" sx={{ mr: 1 }} />
                  Documentos Adicionales
                </Typography>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  {renderFileInput('resolucion', 'Subir Resolución')}
                  {renderFileInput('dictamen', 'Subir Dictamen')}
                  {renderFileInput('carta', 'Subir Carta')}
                  {renderFileInput('nota', 'Subir Nota')}
                  {renderFileInput('certificado_item', 'Subir Certificado Ítem')}
                  {renderFileInput('certificado_presupuestario', 'Subir Certificado Presup.')}
                </Grid>

                <Button 
                  variant="contained" 
                  onClick={subirArchivos}
                  disabled={!Object.values(archivos).some(Boolean)}
                  fullWidth
                  size="large"
                >
                  Subir Documentos Seleccionados
                </Button>

                {/* Lista de documentos existentes */}
                {documentos.length > 0 && (
                  <>
                    <Typography variant="h6" gutterBottom sx={{ mt: 4, display: 'flex', alignItems: 'center' }}>
                      <DownloadIcon color="action" sx={{ mr: 1 }} />
                      Documentos Adjuntos
                    </Typography>
                    <TableContainer component={Paper} sx={{ mt: 2 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Tipo</TableCell>
                            <TableCell align="right">Acciones</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {documentos.map((doc) => (
                            <TableRow key={doc.tipo}>
                              <TableCell>{doc.tipo}</TableCell>
                              <TableCell align="right">
                                <Button
                                  size="small"
                                  onClick={() => descargarArchivo(doc.tipo.split(' ')[0])}
                                  startIcon={<DownloadIcon />}
                                >
                                  Descargar
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Diálogo para vista ampliada del PDF */}
      <Dialog 
        open={openPreview} 
        onClose={handleClosePreview} 
        maxWidth="md" 
        fullWidth
        PaperProps={{ sx: { height: '90vh' } }}
      >
        <DialogContent sx={{ p: 0, height: '100%' }}>
          <Box sx={{ position: 'absolute', right: 8, top: 8, zIndex: 1 }}>
            <IconButton onClick={handleClosePreview}>
              <CloseIcon />
            </IconButton>
          </Box>
          {pdfPreview && (
            <iframe 
              src={pdfPreview} 
              width="100%" 
              height="100%" 
              style={{ border: 'none' }}
              title="Vista ampliada del PDF"
            />
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default GenerarPDF;