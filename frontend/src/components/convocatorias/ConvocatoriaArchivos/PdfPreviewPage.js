//frontend/src/components/convocatorias/ConvocatoriaArchivos/PdfPreviewPage.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../../config/axiosConfig';
import { Box, Alert } from '@mui/material';

function PdfPreviewPage() {
  const { id } = useParams();
  const [pdfUrl, setPdfUrl] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPdf = async () => {
      try {
        const response = await api.get(`/convocatorias-archivos/${id}/ver`, { responseType: 'blob' });
        const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
        setPdfUrl(url);
      } catch (err) {
        setError('Error al cargar el PDF.');
      }
    };

    fetchPdf();
  }, [id]);

  return (
    <Box sx={{ p: 3 }}>
      {error && <Alert severity="error">{error}</Alert>}
      {pdfUrl ? (
        <iframe
          src={pdfUrl}
          title="PDF generado"
          width="100%"
          height="800px"
          style={{ border: '1px solid #ccc', borderRadius: 8 }}
        />
      ) : (
        <Alert severity="info">Cargando PDF...</Alert>
      )}
    </Box>
  );
}

export default PdfPreviewPage;
