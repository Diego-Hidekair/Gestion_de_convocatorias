// frontend/src/components/convocatorias/ConvocatoriaArchivos/PDFViewer.js
import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

const PDFViewer = ({ pdfUrl, onClose, onDownload, open }) => {
  if (!pdfUrl) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Vista previa del PDF</DialogTitle>
      <DialogContent dividers>
        <iframe
          src={pdfUrl}
          title="Vista previa del PDF"
          width="100%"
          height="600px"
          style={{ border: 'none' }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onDownload} variant="outlined" color="primary">
          Descargar
        </Button>
        <Button onClick={onClose} variant="contained" color="secondary">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PDFViewer;
