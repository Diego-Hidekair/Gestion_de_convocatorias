// frontend/src/components/convocatorias/ConvocatoriaArchivos/FileList.js
import React, { useState } from 'react';
import {
  List, ListItem, ListItemText,
  Button, Chip, Stack, Alert, Snackbar
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import api from '../../../config/axiosConfig';
import PDFViewer from './PDFViewer';  // Asegúrate de tener este componente para mostrar PDFs

const FileList = ({ filesInfo, convocatoriaId }) => {
  const [error, setError] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [showViewer, setShowViewer] = useState(false);
  const [currentFileName, setCurrentFileName] = useState('');

  const fileTypes = [
    { key: 'has_resolucion', label: 'Resolución', type: 'resolucion' },
    { key: 'has_dictamen', label: 'Dictamen', type: 'dictamen' },
    { key: 'has_carta', label: 'Carta', type: 'carta' },
    { key: 'has_nota', label: 'Nota', type: 'nota' },
    { key: 'has_certificado_item', label: 'Certificado de Ítem', type: 'certificado_item' },
    { key: 'has_certificado_presupuestario', label: 'Certificado Presupuestario', type: 'certificado_presupuestario' },
  ];

  const handleDownload = async (fileType) => {
    try {
      const response = await api.get(
        `/convocatorias-archivos/${convocatoriaId}/descargar/${fileType}`,
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${fileType}_${convocatoriaId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(`Error al descargar ${fileType}.`);
      console.error(err);
    }
  };

  // Aquí está la modificación: hacemos la petición con axios y mostramos el PDF
  const handleView = async (fileType) => {
    try {
      const response = await api.get(
        `/convocatorias-archivos/${convocatoriaId}/ver-pdf/${fileType}`,
        { responseType: 'blob' }
      );

      // Liberar URL anterior si existía
      if (pdfUrl) {
        window.URL.revokeObjectURL(pdfUrl);
      }

      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      setPdfUrl(url);
      setCurrentFileName(`${fileType}_${convocatoriaId}.pdf`);
      setShowViewer(true);
    } catch (err) {
      setError(`Error al visualizar ${fileType}.`);
      console.error(err);
    }
  };

  return (
    <>
      <List>
        {fileTypes.map(({ key, label, type }) => (
          <ListItem
            key={key}
            divider
            secondaryAction={
              filesInfo[key] ? (
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip color="success" label="Disponible" size="small" />
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<VisibilityIcon />}
                    onClick={() => handleView(type)}
                  >
                    Ver
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleDownload(type)}
                  >
                    Descargar
                  </Button>
                </Stack>
              ) : (
                <Chip color="default" label="No disponible" size="small" />
              )
            }
          >
            <ListItemText primary={label} />
          </ListItem>
        ))}
      </List>

      {showViewer && pdfUrl && (
        <PDFViewer
          pdfUrl={pdfUrl}
          onClose={() => {
            setShowViewer(false);
            window.URL.revokeObjectURL(pdfUrl);
            setPdfUrl(null);
          }}
          onDownload={() => {
            const link = document.createElement('a');
            link.href = pdfUrl;
            link.setAttribute('download', currentFileName);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
          }}
          open={showViewer}
        />
      )}

      <Snackbar
        open={!!error}
        autoHideDuration={4000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default FileList;
