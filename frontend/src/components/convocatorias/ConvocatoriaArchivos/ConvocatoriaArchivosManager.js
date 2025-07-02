// frontend/src/components/convocatorias/ConvocatoriaArchivos/ConvocatoriaArchivosManager.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../config/axiosConfig';
import {
  Box, Button, Alert, Card, CardContent, CardActions, Typography
} from '@mui/material';
import {
  Check as CheckIcon,
  Upload as UploadIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import FileUploadForm from './FileUploadForm';
import FileList from './FileList';

function ConvocatoriaArchivosManager() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [filesInfo, setFilesInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);

  const fetchFilesInfo = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/convocatorias-archivos/${id}/archivos`);
      setFilesInfo(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar archivos');
    } finally {
      setLoading(false);
    }
  };

  const fetchPdfPreview = async () => {
    try {
      const response = await api.get(`/convocatorias-archivos/${id}/ver`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      setPdfUrl(url);
    } catch (err) {
      console.error('Error al precargar el PDF:', err);
    }
  };

  useEffect(() => {
    fetchFilesInfo();
  }, [id]);

  useEffect(() => {
    if (filesInfo?.nombre_archivo) {
      fetchPdfPreview();
    }
  }, [filesInfo]);

  const handleGenerarPDF = async () => {
    try {
      const response = await api.post(`/convocatorias-archivos/${id}/generar`, {}, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      setPdfUrl(url);
      fetchFilesInfo();
    } catch (err) {
      setError('Error al generar el PDF');
    }
  };

  const handleTerminar = () => {
    navigate('/convocatorias');
  };

  return (
    <Box sx={{ p: 3 }}>
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Button variant="contained" startIcon={<UploadIcon />} onClick={handleGenerarPDF}>
        Generar PDF
      </Button>

      <Box sx={{ display: 'flex', mt: 3, gap: 3 }}>
        {/* Vista previa del PDF */}
        <Box sx={{ flex: 2 }}>
          <Typography variant="h6" gutterBottom>Vista previa del documento generado</Typography>
          {pdfUrl ? (
            <iframe
              title="PDF Preview"
              src={pdfUrl}
              width="100%"
              height="600px"
              style={{ border: '1px solid #ccc', borderRadius: 8 }}
            />
          ) : (
            <Typography>No se ha generado aún el documento de convocatoria.</Typography>
          )}
        </Box>

        {/* Documentos Adjuntos */}
        <Box sx={{ flex: 1 }}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6">Documentos Adjuntos</Typography>
                <Button
                  variant={showUploadForm ? 'outlined' : 'contained'}
                  startIcon={showUploadForm ? <CloseIcon /> : <UploadIcon />}
                  onClick={() => setShowUploadForm(!showUploadForm)}
                >
                  {showUploadForm ? 'Cancelar' : 'Subir'}
                </Button>
              </Box>

              {showUploadForm && (
                <FileUploadForm
                  convocatoriaId={id}
                  onSuccess={() => {
                    fetchFilesInfo();
                    setShowUploadForm(false); 
                  }}
                  onError={setError}
                />
              )}

              <FileList
                filesInfo={filesInfo}
                convocatoriaId={id}
                onError={setError}
                onFilesUpdate={fetchFilesInfo}
              />
            </CardContent>
            <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
              <Button variant="contained" onClick={handleTerminar} startIcon={<CheckIcon />}>
                Terminar
              </Button>
            </CardActions>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}

export default ConvocatoriaArchivosManager;
