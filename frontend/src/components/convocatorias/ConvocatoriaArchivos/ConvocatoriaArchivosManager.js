// frontend/src/components/convocatorias/ConvocatoriaArchivos/ConvocatoriaArchivosManager.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../config/axiosConfig';
import {
  Box, Button, Alert, Card, CardContent, CardActions, Typography
} from '@mui/material';
import {
  Check as CheckIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import FileUploadForm from './FileUploadForm';
import FileList from './FileList';

const tipos = [
  'resolucion',
  'dictamen',
  'carta',
  'nota',
  'certificado_item',
  'certificado_presupuestario'
];

function ConvocatoriaArchivosManager() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [filesInfo, setFilesInfo] = useState({});
  const [selectedFiles, setSelectedFiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUploadForm, setShowUploadForm] = useState(false);

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

  useEffect(() => {
    fetchFilesInfo();
  }, [id]);

  const handleViewPDF = async () => {
  try {
    const response = await api.get(`/pdf/${id}/ver`, {
      responseType: 'blob'
    });
    const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
    const pdfURL = URL.createObjectURL(pdfBlob);
    window.open(pdfURL, '_blank');
  } catch (err) {
    setError('Error al visualizar el PDF generado');
  }
};

  const handleDownloadPDF = async () => {
  try {
    const response = await api.get(`/pdf/${id}/ver`, {
      responseType: 'blob'
    });
    const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `convocatoria_${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    setError('Error al descargar el PDF');
  }
};  

  const handleTerminar = () => {
    navigate('/convocatorias');
  };

  const handleGenerarPDF = async () => {
  try {
    const response = await api.post(`/pdf/${id}/generar`, {}, {
      responseType: 'blob'
    });
    const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    window.open(url, '_blank');
    fetchFilesInfo(); // actualiza el estado
  } catch (err) {
    setError('Error al generar el PDF');
  }
};
  return (
    <Box sx={{ p: 3 }}>
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* DOCUMENTO GENERADO */}
      <Button 
  variant="contained" 
  startIcon={<UploadIcon />} 
  onClick={handleGenerarPDF}
>
  Generar PDF
</Button>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Documento de Convocatoria</Typography>
          {filesInfo?.nombre_archivo ? (
            <>
              <Typography paragraph>Documento generado disponible</Typography>
              <Box display="flex" gap={2}>
                <Button variant="contained" startIcon={<VisibilityIcon />} onClick={handleViewPDF}>Ver PDF</Button>
                <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleDownloadPDF}>Descargar PDF</Button>
              </Box>
            </>
          ) : (
            <Typography paragraph>No se ha generado el documento de convocatoria.</Typography>
          )}
        </CardContent>
      </Card>

      {/* DOCUMENTOS ADJUNTOS */}
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6">Documentos Adjuntos</Typography>
            <Button
              variant={showUploadForm ? 'outlined' : 'contained'}
              startIcon={showUploadForm ? <CloseIcon /> : <UploadIcon />}
              onClick={() => setShowUploadForm(!showUploadForm)}
            >
              {showUploadForm ? 'Cancelar' : 'Subir Documentos'}
            </Button>
          </Box>

          {/* FORMULARIO DE SUBIDA */}
          {showUploadForm && (
            <FileUploadForm
              convocatoriaId={id}
              onSuccess={fetchFilesInfo}
              onError={setError}
            />
          )}

          {/* LISTA DE ARCHIVOS */}
          <FileList
            filesInfo={filesInfo}
            convocatoriaId={id}
            onError={setError}
            onFilesUpdate={fetchFilesInfo}
          />
        </CardContent>

        <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleTerminar}
            startIcon={<CheckIcon />}
          >
            Terminar
          </Button>
        </CardActions>
      </Card>
    </Box>
  );
}

export default ConvocatoriaArchivosManager;
