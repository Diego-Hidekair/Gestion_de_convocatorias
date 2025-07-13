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
    setError(null);
  } catch (err) {
    if (err.response?.data?.faltantes) {
      const { faltantes } = err.response.data;
      const faltan = [];

      if (!faltantes.resolucion) faltan.push('Resolución Facultativa');
      if (!faltantes.dictamen) faltan.push('Dictamen de carrera');
      if (!faltantes.certificado_presupuestario) faltan.push('Certificación Presupuestaria');

      setError(`⚠️ No se puede generar el PDF. Faltan los siguientes documentos obligatorios: ${faltan.join(', ')}`);
    } else {
      setError(err.response?.data?.error || 'Error al generar el PDF faltan los documentos: Resolución, Dictamen y Certificación Presupuestaria');
    }
  }
};
  
  const handleDownloadByType = async (tipo) => {
    try {
      const response = await api.get(`/convocatorias-archivos/${id}/descargar/${tipo}`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${tipo}_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(`Error al descargar ${tipo}:`, err);
      setError(`No se pudo descargar el archivo: ${tipo}`);
    }
  };

  const handleTerminar = () => {
    navigate('/convocatorias');
  };

  return (
    <Box sx={{ p: 3 }}>
      {error && <Alert severity="warning" sx={{ mb: 3 }}>{error}</Alert>}

      <Button variant="contained" startIcon={<UploadIcon />} onClick={handleGenerarPDF}>
        Generar PDF
      </Button>

      <Box sx={{ display: 'flex', mt: 3, gap: 3 }}>
        {/* Vista previa del PDF */}
        <Box sx={{ flex: 2 }}>
          {pdfUrl ? (
            <>
              <Alert severity="success" sx={{ fontSize: '1rem', borderRadius: 2 }}>Vista previa del documento generado</Alert>
              <iframe
                title="PDF Preview"
                src={pdfUrl}
                width="100%"
                height="600px"
                style={{ border: '1px solid #ccc', borderRadius: 8 }}
              />
            </>
          ) : (
            <Alert severity="info" sx={{ fontSize: '1rem', borderRadius: 2 }}>
              Suba los documentos de: <strong>Resolución</strong>, <strong>Dictamen</strong> y <strong>Certificación Presupuestaria</strong> antes de generar el documento PDF.
            </Alert>
          )}
        </Box>

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
                onDownload={handleDownloadByType}
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

