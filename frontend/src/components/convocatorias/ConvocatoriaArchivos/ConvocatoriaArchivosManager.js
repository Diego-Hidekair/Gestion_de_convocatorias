// frontend/src/components/convocatorias/ConvocatoriaArchivos/ConvocatoriaArchivosManager.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Box, Button, CircularProgress, Alert, Card, CardContent, CardActions, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Fab, Tooltip, IconButton } from '@mui/material';
import { Check as CheckIcon, Visibility as VisibilityIcon, Download as DownloadIcon, Upload as UploadIcon, Close as CloseIcon } from '@mui/icons-material';
import PDFViewer from './PDFViewer';
import FileUploadForm from './FileUploadForm';
import FileList from './FileList';

const ConvocatoriaArchivosManager = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [filesInfo, setFilesInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const token = localStorage.getItem('token');

  const handleTerminar = () => {
    navigate('/convocatorias');
  };

  const handleConfirmTerminar = () => {
    setOpenConfirm(true);
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };

  const fetchFilesInfo = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:5000/convocatorias-archivos/${id}/archivos`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFilesInfo(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar archivos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilesInfo();
  }, [id]);

  const generatePDF = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:5000/convocatorias-archivos/${id}/generar-pdf`,
        { 
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );
      
      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);
      setShowPdfViewer(true);
      setIsCompleted(true);
      
      await fetchFilesInfo();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al generar PDF');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = () => {
    setShowUploadForm(false);
    fetchFilesInfo();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={5}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Dialog
        open={openConfirm}
        onClose={handleCloseConfirm}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirmar acción</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas terminar? Serás redirigido a la lista de convocatorias.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm}>Cancelar</Button>
          <Button 
            onClick={handleTerminar}
            variant="contained"
            color="primary"
            startIcon={<CheckIcon />}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {showPdfViewer ? (
        <PDFViewer 
          pdfUrl={pdfUrl} 
          onClose={() => setShowPdfViewer(false)}
          onDownload={() => window.open(pdfUrl, '_blank')}
        />
      ) : (
        <>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Documento de Convocatoria
              </Typography>
              {filesInfo?.nombre_archivo ? (
                <>
                  <Typography paragraph>
                    Documento generado: {filesInfo.nombre_archivo}
                  </Typography>
                  <Box display="flex" gap={2}>
                    <Button
                      variant="contained"
                      startIcon={<VisibilityIcon />}
                      onClick={() => {
                        const url = `http://localhost:5000/convocatorias-archivos/${id}/ver-pdf`;
                        setPdfUrl(url);
                        setShowPdfViewer(true);
                      }}
                    >
                      Ver PDF
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={() => {
                        window.open(
                          `http://localhost:5000/convocatorias-archivos/${id}/descargar/doc_conv`,
                          '_blank'
                        );
                      }}
                    >
                      Descargar PDF
                    </Button>
                  </Box>
                </>
              ) : (
                <Typography paragraph>
                  No se ha generado el documento de convocatoria
                </Typography>
              )}
              <Button
                variant="contained"
                color="primary"
                onClick={generatePDF}
                sx={{ mt: 2 }}
              >
                Generar PDF
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6">Documentos Adjuntos</Typography>
                <Button
                  variant={showUploadForm ? "outlined" : "contained"}
                  startIcon={showUploadForm ? <CloseIcon /> : <UploadIcon />}
                  onClick={() => setShowUploadForm(!showUploadForm)}
                >
                  {showUploadForm ? 'Cancelar' : 'Subir Documentos'}
                </Button>
              </Box>

              {showUploadForm && (
                <FileUploadForm 
                  convocatoriaId={id} 
                  onSuccess={handleUploadSuccess}
                  onError={setError}
                />
              )}

              <FileList 
                filesInfo={filesInfo} 
                convocatoriaId={id}
              />
            </CardContent>
            <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
              <Button
                variant="contained"
                color={isCompleted ? "success" : "primary"}
                onClick={handleConfirmTerminar}
                startIcon={isCompleted ? <CheckIcon /> : null}
                sx={{ ml: 2 }}
              >
                {isCompleted ? 'Terminado' : 'Terminar'}
              </Button>
            </CardActions>
          </Card>
        </>
      )}
      
      <Tooltip title="Terminar proceso">
        <Fab
          color={isCompleted ? "success" : "primary"}
          onClick={handleConfirmTerminar}
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
          }}
        >
          <CheckIcon />
        </Fab>
      </Tooltip>
    </Box>
  );
};

export default ConvocatoriaArchivosManager;