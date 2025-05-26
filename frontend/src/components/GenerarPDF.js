// frontend/src/components/GenerarPDF.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container, Typography, Button, CircularProgress, Alert,
  Card, CardContent, Box, Dialog, DialogContent, IconButton
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DownloadIcon from '@mui/icons-material/Download';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const GenerarPDF = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [openPreview, setOpenPreview] = useState(false);

  const token = localStorage.getItem('token');


 const cargarPDF = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Verificar si la convocatoria existe primero
      await axios.get(`http://localhost:5000/convocatorias/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Intentar cargar el PDF
      const response = await axios.get(
        `http://localhost:5000/convocatorias/${id}/archivos/doc_conv`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      const blob = new Blob([response.data], { type: 'application/pdf' });
      setPdfUrl(URL.createObjectURL(blob));
      
    } catch (err) {
      if (err.response?.status === 404) {
        console.log("PDF no encontrado, se debe generar");
      } else {
        setError('Error al cargar el documento');
      }
    } finally {
      setLoading(false);
    }
  };

  const generarPDF = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Generar el PDF
      await axios.post(
        `http://localhost:5000/pdf/${id}/generar`,
        {},
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      setSuccess('PDF generado correctamente');
      
      // Recargar el PDF después de generarlo
      await cargarPDF();
      
    } catch (err) {
      setError(err.response?.data?.error || 'Error al generar PDF');
    } finally {
      setLoading(false);
    }
  };

  const descargarPDF = () => {
    if (!pdfUrl) return;
    
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.setAttribute('download', `convocatoria_${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  useEffect(() => {
    cargarPDF();
    
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [id]);

return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Documento de Convocatoria #{id}
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/convocatorias/${id}`)}
        >
          Volver
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

      <Card>
        <CardContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Box sx={{ height: '500px', border: '1px dashed #ccc', mb: 2 }}>
                {pdfUrl ? (
                  <iframe 
                    src={pdfUrl}
                    width="100%" 
                    height="100%" 
                    style={{ border: 'none' }}
                    title="Vista previa del PDF"
                  />
                ) : (
                  <Box sx={{ textAlign: 'center', p: 4 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      No hay PDF generado para esta convocatoria
                    </Typography>
                    <Button 
                      variant="contained" 
                      onClick={generarPDF}
                      startIcon={<PictureAsPdfIcon />}
                    >
                      Generar Documento
                    </Button>
                  </Box>
                )}
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  onClick={() => setOpenPreview(true)}
                  disabled={!pdfUrl}
                  startIcon={<PictureAsPdfIcon />}
                >
                  Vista Ampliada
                </Button>
                <Button
                  variant="outlined"
                  onClick={descargarPDF}
                  disabled={!pdfUrl}
                  startIcon={<DownloadIcon />}
                >
                  Descargar
                </Button>
              </Box>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={openPreview} onClose={() => setOpenPreview(false)} fullWidth maxWidth="lg">
        <DialogContent sx={{ height: '80vh', p: 0 }}>
          {pdfUrl && (
            <iframe 
              src={pdfUrl}
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