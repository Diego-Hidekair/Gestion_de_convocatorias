// frontend/src/components/convocatorias/ConvocatoriaArchivos/FileUploadForm.js
import React, { useState } from 'react';
import { Button, Typography, Box, Alert, FormControl, InputLabel, Input,Stack, } from '@mui/material';
import api from '../../../config/axiosConfig';

const FileUploadForm = ({ convocatoriaId, onSuccess, onError }) => {

  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e, field) => {
    setFiles(prev => ({
      ...prev,
      [field]: e.target.files[0],
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(null);

  try {
    for (const [field, file] of Object.entries(files)) {
    if (!file) continue;

    const formData = new FormData();
    formData.append('archivo', file); 
    formData.append('tipo', field); 

      await api.post(`/pdf/${convocatoriaId}/upload`, formData,{
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
}

    if (onSuccess) onSuccess();
  } catch (err) {
    const errorMsg = err.response?.data?.error || err.message;
    setError(errorMsg);
    if (onError) onError(errorMsg);
  } finally {
    setLoading(false);
  }
};

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack spacing={2}>
        <FormControl fullWidth>
          <InputLabel htmlFor="resolucion">Resolución</InputLabel>
          <Input
            id="resolucion"
            type="file"
            onChange={(e) => handleFileChange(e, 'resolucion')}
            inputProps={{ accept: '.pdf,.doc,.docx' }}
          />
        </FormControl>

        <FormControl fullWidth>
          <InputLabel htmlFor="dictamen">Dictamen</InputLabel>
          <Input
            id="dictamen"
            type="file"
            onChange={(e) => handleFileChange(e, 'dictamen')}
            inputProps={{ accept: '.pdf,.doc,.docx' }}
          />
        </FormControl>

        <FormControl fullWidth>
          <InputLabel htmlFor="carta">Carta</InputLabel>
          <Input
            id="carta"
            type="file"
            onChange={(e) => handleFileChange(e, 'carta')}
            inputProps={{ accept: '.pdf,.doc,.docx' }}
          />
        </FormControl>

        <FormControl fullWidth>
          <InputLabel htmlFor="nota">Nota</InputLabel>
          <Input
            id="nota"
            type="file"
            onChange={(e) => handleFileChange(e, 'nota')}
            inputProps={{ accept: '.pdf,.doc,.docx' }}
          />
        </FormControl>

        <FormControl fullWidth>
          <InputLabel htmlFor="certificado_item">Certificado de Ítem</InputLabel>
          <Input
            id="certificado_item"
            type="file"
            onChange={(e) => handleFileChange(e, 'certificado_item')}
            inputProps={{ accept: '.pdf,.doc,.docx' }}
          />
        </FormControl>

        <FormControl fullWidth>
          <InputLabel htmlFor="certificado_presupuestario">Certificado Presupuestario</InputLabel>
          <Input
            id="certificado_presupuestario"
            type="file"
            onChange={(e) => handleFileChange(e, 'certificado_presupuestario')}
            inputProps={{ accept: '.pdf,.doc,.docx' }}
          />
        </FormControl>

        <Button
          variant="contained"
          color="primary"
          type="submit"
          disabled={loading}
          size="large"
        >
          {loading ? 'Subiendo...' : 'Subir Archivos'}
        </Button>
      </Stack>
    </Box>
  );
};

export default FileUploadForm;
