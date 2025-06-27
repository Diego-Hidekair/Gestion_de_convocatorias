// frontend/src/components/convocatorias/ConvocatoriaArchivos/FileList.js
import React, { useState } from 'react';
import {
  List, ListItem, ListItemText, Button, Chip, Stack, Alert, Snackbar
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../../../config/axiosConfig';

const fileTypes = [
  { key: 'has_resolucion', label: 'Resolución Facultativa', type: 'resolucion' },
  { key: 'has_dictamen', label: 'Dictamen de carrera', type: 'dictamen' },
  { key: 'has_carta', label: 'Carta de decanatura', type: 'carta' },
  { key: 'has_nota', label: 'Informe extra', type: 'nota' },
  { key: 'has_certificado_item', label: 'Certificación de Item', type: 'certificado_item' },
  { key: 'has_certificado_presupuestario', label: 'Certificación Presupuestaria', type: 'certificado_presupuestario' },
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

  return (
    <>
      <List>
        {fileTypes.map(({ key, label, type }) => (
          <ListItem
            key={key}
            divider
            secondaryAction={
              filesInfo[key] ? (
                <Stack direction="row" spacing={1}>
                  <Chip color="success" label="Disponible" size="small" />
                  <Button size="small" variant="outlined" onClick={() => handleView(type)} startIcon={<VisibilityIcon />}>Ver</Button>
                  <Button size="small" variant="contained" onClick={() => handleDownload(type)} startIcon={<DownloadIcon />}>Descargar</Button>
                  <Button size="small" color="error" variant="outlined" onClick={() => handleDelete(type)} startIcon={<DeleteIcon />}>Eliminar</Button>
                </Stack>
              ) : (
                <Chip label="No disponible" color="default" size="small" />
              )
            }
          >
            <ListItemText primary={label} />
          </ListItem>
        ))}
      </List>

      <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError(null)}>
        <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>
      </Snackbar>
    </>
  );
};

export default FileList;
