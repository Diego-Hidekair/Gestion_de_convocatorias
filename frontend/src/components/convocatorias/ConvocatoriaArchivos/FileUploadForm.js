// frontend/src/components/convocatorias/ConvocatoriaArchivos/FileUploadForm.js
import React, { useState } from 'react';
import {
  Button,
  Typography,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Input,
  Stack,
  Paper,
  Grid,
  IconButton,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DescriptionIcon from '@mui/icons-material/Description';
import api from '../../../config/axiosConfig';

const FileUploadForm = ({ convocatoriaId, onSuccess, onError }) => {
  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleFileChange = (e, field) => {
    setFiles((prev) => ({
      ...prev,
      [field]: e.target.files[0],
    }));
    setMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      let uploadedAny = false;
      for (const [field, file] of Object.entries(files)) {
        if (!file) continue;

        const formData = new FormData();
        formData.append('archivo', file);
        formData.append('tipo', field);

        await api.post(`/pdf/${convocatoriaId}/subir`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        uploadedAny = true;
      }
      if (uploadedAny) {
        setMessage({ type: 'success', text: 'Archivos subidos correctamente.' });
        if (onSuccess) onSuccess();
        setFiles({});
      } else {
        setMessage({ type: 'warning', text: 'No seleccionaste ningún archivo.' });
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setMessage({ type: 'error', text: errorMsg });
      if (onError) onError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const campos = [
    { id: 'resolucion', label: 'Resolución', desc: 'Archivo PDF o Word con la resolución' },
    { id: 'dictamen', label: 'Dictamen', desc: 'Documento oficial dictaminado' },
    { id: 'carta', label: 'Carta', desc: 'Carta formal adjunta' },
    { id: 'nota', label: 'Nota', desc: 'Nota explicativa o adicional' },
    { id: 'certificado_item', label: 'Certificado de Ítem', desc: 'Certificado oficial del ítem' },
    { id: 'certificado_presupuestario', label: 'Certificado Presupuestario', desc: 'Documento presupuestario' },
  ];

  return (
    <Paper elevation={6} sx={{ p: 4, mb: 4, borderRadius: 3 }}>
      <Typography variant="h5" fontWeight="bold" color="primary" gutterBottom>
        📤 Subir Documentos Adjuntos
      </Typography>

      {message && (
        <Alert severity={message.type} sx={{ mb: 3, fontWeight: 'medium' }}>
          {message.text}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {campos.map(({ id, label, desc }) => (
            <Paper
              key={id}
              variant="outlined"
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                borderRadius: 2,
                bgcolor: '#f9f9f9',
              }}
            >
              <FormControl fullWidth>
                <InputLabel shrink htmlFor={id} sx={{ fontWeight: 'bold' }}>
                  {label}
                </InputLabel>
                <Input
                  id={id}
                  type="file"
                  onChange={(e) => handleFileChange(e, id)}
                  inputProps={{ accept: '.pdf,.doc,.docx' }}
                  disabled={loading}
                />
              </FormControl>
              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                {desc}
              </Typography>

              {files[id] && (
                <Box
                  sx={{
                    mt: 1,
                    display: 'flex',
                    alignItems: 'center',
                    bgcolor: '#e3f2fd',
                    borderRadius: 1,
                    p: '4px 8px',
                    width: 'fit-content',
                  }}
                >
                  <DescriptionIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    {files[id].name}
                  </Typography>
                </Box>
              )}
            </Paper>
          ))}

          <Button
            variant="contained"
            color="secondary"
            type="submit"
            disabled={loading}
            size="large"
            startIcon={<UploadFileIcon />}
            sx={{
              borderRadius: 3,
              boxShadow: '0 4px 12px rgb(25 118 210 / 0.6)',
              ':hover': {
                boxShadow: '0 6px 20px rgb(25 118 210 / 0.8)',
              },
            }}
          >
            {loading ? 'Subiendo...' : 'Subir Archivos'}
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
};

export default FileUploadForm;
