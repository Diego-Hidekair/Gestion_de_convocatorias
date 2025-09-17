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

import DoneOutlineIcon from '@mui/icons-material/DoneOutline';
import FileList from './FileList';

function ConvocatoriaArchivosManager() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [filesInfo, setFilesInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [convocatoriaNombre, setConvocatoriaNombre] = useState('');

  const fetchConvocatoriaInfo = async () => {
    try {
      const response = await api.get(`/convocatorias/${id}`);
      setConvocatoriaNombre(response.data.nombre_conv);
    } catch (err) {
      console.error('Error al cargar información de la convocatoria:', err);
    }
  };

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
    fetchConvocatoriaInfo();
    fetchFilesInfo();
  }, [id]);

  useEffect(() => {
    if (filesInfo?.nombre_archivo) {
      fetchPdfPreview();
    }
  }, [filesInfo]);

  const handleGenerarPDF = async () => {
    const requiredFields = [
      { key: 'has_resolucion', label: 'Resolución Facultativa' },
      { key: 'has_dictamen', label: 'Dictamen de carrera' },
      { key: 'has_certificado_presupuestario', label: 'Certificación Presupuestaria' }
    ];
    const faltantes = requiredFields.filter(field => !filesInfo[field.key]);
      if (faltantes.length > 0) {
      const nombres = faltantes.map(f => f.label).join(', ');
      setError(`No se permite generar el PDF. Faltan los documentos: ${nombres}`);
      return;
    }
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

      setError(` No se puede generar el PDF. Faltan los siguientes documentos obligatorios: ${faltan.join(', ')}`);
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
    <Box sx={{ p: 1 }}>
      {error && <Alert severity="warning" sx={{ mb: 3 }}>{error}</Alert>}
       {convocatoriaNombre && (
        <Box sx={{ 
          mb: 1, 
          p: 1, 
          backgroundColor: '#5597daff', 
          borderRadius: 3,
          boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
          border: '2px solid #3d8de9ff',
          textAlign: 'center'
        }}>
          <Typography 
            variant="h7" 
            sx={{ 
              color: 'white', 
              fontWeight: 'bold',
              fontFamily: '"Georgia", "Times New Roman", serif',
              textShadow: '1px 1px 1px rgba(0, 0, 0, 0.3)',
              letterSpacing: '0.5px'
            }}
          >
             {convocatoriaNombre}
          </Typography>
        </Box>
      )}

      <Box sx={{ display: 'flex', mt: 3, gap: 3 }}>
        {/* Vista previa del PDF */}
        <Box sx={{ flex: 2 }}>
          {pdfUrl ? (
            <>
              <Alert severity="success" sx={{ fontSize: '1rem', borderRadius: 2, mb: 2 }}>
                Vista previa del documento generado
              </Alert>
              <iframe
                title="PDF Preview"
                src={pdfUrl}
                width="100%"
                height="600px"
                style={{ border: '1px solid #ccc', borderRadius: 8 }}
              />
            </>
          ) : (
            <Box sx={{ 
              height: '600px', 
              border: '2px dashed #1976d2', 
              borderRadius: 3, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: '#f8f9fa'
            }}>
              <Typography variant="body1" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                El PDF se generará después de subir los documentos obligatorios
              </Typography>
            </Box>
          )}
        </Box>

        <Box sx={{ flex: 1 }}>
          <Card sx={{ boxShadow: 3 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                  ?? Documentos Adjuntos
                </Typography>
              </Box>

              <FileList
                filesInfo={filesInfo}
                convocatoriaId={id}
                onError={setError}
                onFilesUpdate={fetchFilesInfo}
                onDownload={handleDownloadByType}
              />

            </CardContent>
            <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
              <Button
                variant="contained"
                color="secondary"
                onClick={async () => {
                  const prevUrl = pdfUrl;
                  await handleGenerarPDF();
                  if (pdfUrl !== prevUrl) {
                    navigate(`/convocatorias/${id}/pdf`);
                  }
                }}
                startIcon={<UploadIcon />}
                sx={{ fontWeight: 'bold' }}
              >
                Generar PDF
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={() => navigate('/convocatorias')}
                startIcon={<DoneOutlineIcon />}
                sx={{ fontWeight: 'bold' }}
              >
                Concluir Convocatoria
              </Button>
            </CardActions>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}

export default ConvocatoriaArchivosManager;