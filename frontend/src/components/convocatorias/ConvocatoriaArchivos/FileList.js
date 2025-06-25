// frontend/src/components/convocatorias/ConvocatoriaArchivos/FileList.js
import React from 'react';
import { List, ListItem, ListItemText, ListItemSecondaryAction, Button, Chip, Stack, } from '@mui/material';
import api from '../../../config/axiosConfig';

const FileList = ({ filesInfo, convocatoriaId }) => {
  if (!filesInfo) return null;

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

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${fileType}_${convocatoriaId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error(`Error al descargar ${fileType}:`, error);
      alert('Error al descargar el archivo. Verifica si está disponible.');
    }
  };

  return (
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
                  variant="contained"
                  size="small"
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
  );
};

export default FileList;
