// frontend/src/components/convocatorias/ConvocatoriaArchivos/PDFViewer.js
import React from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton, Button, Box, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import api from '../../../config/axiosConfig';

const PDFViewer = ({ pdfUrl, onClose, open, fileName = 'archivo.pdf' }) => {
  const handleDownload = async () => {
    try {
      const response = await api.get(pdfUrl, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error al descargar el PDF:', error);
      alert('Error al descargar el archivo PDF');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xl"
      scroll="paper"
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Vista previa del PDF</Typography>
        <Box>
          <Button variant="contained" color="primary" onClick={handleDownload} sx={{ mr: 2 }}>
            Descargar
          </Button>
          <IconButton
            aria-label="cerrar"
            onClick={onClose}
            sx={{
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers sx={{ height: '80vh', p: 0 }}>
        <iframe
          src={pdfUrl}
          title="PDF Viewer"
          style={{ width: '100%', height: '100%', border: 'none' }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default PDFViewer;
