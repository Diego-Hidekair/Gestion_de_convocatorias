import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Container, Typography, Button, CircularProgress, Alert,
  Card, CardContent, Box, Grid, FormControl, InputLabel,
  Select, MenuItem, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper
} from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import DownloadIcon from '@mui/icons-material/Download';

const SubirArchivos = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [documentos, setDocumentos] = useState([]);
  const [tipoArchivo, setTipoArchivo] = useState('');
  const [archivo, setArchivo] = useState(null);

  const token = localStorage.getItem('token');

  const tiposDocumentos = [
    { value: 'resolucion', label: 'Resolución' },
    { value: 'dictamen', label: 'Dictamen' },
    { value: 'carta', label: 'Carta' },
    { value: 'nota', label: 'Nota' },
    { value: 'certificado_item', label: 'Certificado Ítem' },
    { value: 'certificado_presupuestario', label: 'Certificado Presupuestario' }
  ];

  const cargarDocumentos = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:5000/convocatorias/${id}/archivos`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setDocumentos(response.data);
    } catch (err) {
      setError('Error al cargar documentos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDocumentos();
  }, [id]);

  const handleFileChange = (e) => {
    setArchivo(e.target.files[0]);
  };

  const subirArchivo = async () => {
    if (!tipoArchivo || !archivo) {
      setError('Seleccione un tipo de documento y un archivo');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append(tipoArchivo, archivo);

      await axios.post(
        `http://localhost:5000/convocatorias/${id}/archivos`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setSuccess('Archivo subido correctamente');
      setTipoArchivo('');
      setArchivo(null);
      await cargarDocumentos();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al subir archivo');
    } finally {
      setLoading(false);
    }
  };

  const descargarArchivo = async (tipo) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/convocatorias/${id}/archivos/${tipo}`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${tipo}_convocatoria_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Error al descargar el archivo');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Documentos Adicionales - Convocatoria #{id}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>{success}</Alert>}

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Subir Nuevo Documento
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Documento</InputLabel>
                <Select
                  value={tipoArchivo}
                  onChange={(e) => setTipoArchivo(e.target.value)}
                  label="Tipo de Documento"
                >
                  {tiposDocumentos.map((tipo) => (
                    <MenuItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <Button
                variant="contained"
                component="label"
                fullWidth
                startIcon={<UploadIcon />}
              >
                Seleccionar Archivo
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  hidden
                />
              </Button>
              {archivo && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Archivo seleccionado: {archivo.name}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12} md={4}>
              <Button
                variant="contained"
                onClick={subirArchivo}
                disabled={!tipoArchivo || !archivo || loading}
                fullWidth
              >
                {loading ? <CircularProgress size={24} /> : 'Subir Documento'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Documentos Adjuntos
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : documentos.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {documentos.map((doc) => (
                    <TableRow key={doc.tipo}>
                      <TableCell>{doc.tipo}</TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          startIcon={<DownloadIcon />}
                          onClick={() => descargarArchivo(doc.tipo.split(' ')[0].toLowerCase())}
                        >
                          Descargar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body1" color="textSecondary" sx={{ textAlign: 'center', p: 2 }}>
              No hay documentos adjuntos
            </Typography>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default SubirArchivos;