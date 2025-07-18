// frontend/src/components/convocatorias/ConvocatoriaArchivos/FileList.js
import React, { useState } from 'react';
import {
  List, ListItem, ListItemText, Button, Chip, Stack, Alert, Snackbar, Paper
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import api from '../../../config/axiosConfig';

const fileTypes = [
  { key: 'has_carta', label: 'Carta de decanatura', type: 'carta' },
  { key: 'has_resolucion', label: 'Resolución Facultativa', type: 'resolucion' },
  { key: 'has_dictamen', label: 'Dictamen de carrera', type: 'dictamen' },
  { key: 'has_certificado_presupuestario', label: 'Certificación Presupuestaria', type: 'certificado_presupuestario' },
  { key: 'has_certificado_item', label: 'Certificación de Item', type: 'certificado_item' },
  { key: 'has_nota', label: 'Otros', type: 'nota' },
];

const FileList = ({ filesInfo, convocatoriaId, onError, onFilesUpdate }) => {
  const [error, setError] = useState(null);

  const handleDownload = async (tipo) => {
    try {
      const response = await api.get(`/convocatorias-archivos/${convocatoriaId}/descargar/${tipo}`, {
        responseType: 'blob'
      });
      const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${tipo}_${convocatoriaId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      const msg = `Error al descargar ${tipo}.`;
      setError(msg);
      if (onError) onError(msg);
    }
  };

  const handleView = async (tipo) => {
    try {
      const response = await api.get(`/convocatorias-archivos/${convocatoriaId}/ver-pdf/${tipo}`, {
        responseType: 'blob'
      });
      const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      window.open(url, '_blank');
    } catch (err) {
      const msg = `Error al visualizar ${tipo}.`;
      setError(msg);
      if (onError) onError(msg);
    }
  };

  const handleDelete = async (tipo) => {
    if (!window.confirm(`¿Estás seguro de eliminar el documento "${tipo}"?`)) return;

    try {
      await api.delete(`/convocatorias-archivos/${convocatoriaId}/eliminar/${tipo}`);
      if (onFilesUpdate) onFilesUpdate();
    } catch (err) {
      const msg = `Error al eliminar ${tipo}.`;
      setError(msg);
      if (onError) onError(msg);
    }
  };

  if (!filesInfo) return null;
  const handleUpload = async (e, tipo) => {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append(tipo, file);

  try {
    await api.post(`/convocatorias-archivos/${convocatoriaId}/subir-multiples`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    setError(null);
    if (onFilesUpdate) onFilesUpdate();
  } catch (err) {
    const msg = `Error al subir ${tipo}.`;
    setError(msg);
    if (onError) onError(msg);
  }
};

  return (
    <>
      <List>
        {fileTypes.map(({ key, label, type }) => (
  <Paper
    elevation={3}
    sx={{
      mb: 2,
      p: 2,
      borderRadius: 2,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}
    key={key}
  >
<ListItemText primary={label} />

    <Stack direction="row" spacing={1} alignItems="center">
      {filesInfo[key] ? (
        <>
          <Chip color="success" label="Listo" size="small" />
          <Button size="small" variant="outlined" onClick={() => handleView(type)} startIcon={<VisibilityIcon />}>Ver</Button>
          <Button size="small" color="error" variant="outlined" onClick={() => handleDelete(type)} startIcon={<DeleteIcon />}>Eliminar</Button>
        </>
      ) : (
        <>
 <Chip label="Pendiente" color="default" size="small" />
          <label htmlFor={`file-input-${type}`}>
            <input
              id={`file-input-${type}`}
              type="file"
              accept="application/pdf"
              style={{ display: 'none' }}
              onChange={(e) => handleUpload(e, type)}
            />
            <Button
              component="span"
              size="small"
              variant="contained"
              color="primary"
              startIcon={<UploadFileIcon />}
            >
              Cargar <br></br> Documento
              
            </Button>
          </label>
        </>
      )}
    </Stack>
  </Paper>
))}
   </List>

      <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError(null)}>
        <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>
      </Snackbar>
    </>
  );
};

export default FileList;
