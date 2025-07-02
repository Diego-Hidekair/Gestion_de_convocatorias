// frontend/src/components/convocatorias/ConvocatoriaArchivos/FileUploadForm.js
import React, { useState } from 'react';
import {
  Button, Typography, Box, Alert, Stack, Paper, InputLabel, Input
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DescriptionIcon from '@mui/icons-material/Description';
import api from '../../../config/axiosConfig';

const campos = [
  { id: 'resolucion', label: 'Resolución Facultativa' },
  { id: 'dictamen', label: 'Dictamen de carrera' },
  { id: 'carta', label: 'Carta de decanatura' },
  { id: 'nota', label: 'Informe extra' },
  { id: 'certificado_item', label: 'Certificación de Item' },
  { id: 'certificado_presupuestario', label: 'Certificación Presupuestaria' },
];

const FileUploadForm = ({ convocatoriaId, onSuccess, onError }) => {
  const [files, setFiles] = useState({});
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e, campoId) => {
    setFiles((prev) => ({
      ...prev,
      [campoId]: e.target.files[0]
    }));
    setMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData();
    let hasFiles = false;

    for (const { id } of campos) {
      if (files[id]) {
        formData.append(id, files[id]);
        hasFiles = true;
      }
    }

    if (!hasFiles) {
      setMessage({ type: 'warning', text: 'No seleccionaste ningún archivo.' });
      setLoading(false);
      return;
    }

    try {
      await api.post(`/convocatorias-archivos/${convocatoriaId}/subir-multiples`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setFiles({});
      setMessage({ type: 'success', text: 'Archivos subidos correctamente.' });
      if (onSuccess) onSuccess();
    } catch (err) {
      const msg = err.response?.data?.error || err.message;
      setMessage({ type: 'error', text: msg });
      if (onError) onError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={6} sx={{ p: 4, mb: 4, borderRadius: 3 }}>
      <Typography variant="h5" fontWeight="bold" color="primary" gutterBottom>
        Subir Documentos Adjuntos
      </Typography>

      {message && <Alert severity={message.type} sx={{ mb: 2 }}>{message.text}</Alert>}

      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={3}>
         {campos.map(({ id, label }) => {
  const archivo = files[id];

  return (
    <Paper
      key={id}
      elevation={2}
      sx={{
        p: 2,
        borderRadius: 2,
        border: '1px solid #e0e0e0',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        justifyContent: 'space-between'
      }}
    >
      <DescriptionIcon color="action" />

      <Box flex={1}>
        <InputLabel sx={{ mb: 1 }}>{label}</InputLabel>

        <label htmlFor={`file-input-${id}`}>
          <input
            id={`file-input-${id}`}
            type="file"
            accept="application/pdf"
            style={{ display: 'none' }}
            onChange={(e) => handleFileChange(e, id)}
          />
          <Button
            component="span"
            variant="contained"
            size="small"
            color={archivo ? 'success' : 'primary'}
          >
            Subir
          </Button>
        </label>

        {archivo && (
          <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic', color: 'text.secondary' }}>
            {archivo.name}
          </Typography>
        )}
      </Box>
    </Paper>
  );
})}
          <Button
            type="submit"
            variant="contained"
            startIcon={<UploadFileIcon />}
            disabled={loading}
          >
            {loading ? 'Subiendo...' : 'Subir Archivos'}
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
};

export default FileUploadForm;
