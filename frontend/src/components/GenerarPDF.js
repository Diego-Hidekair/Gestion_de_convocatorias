// frontend/src/components/GenerarPDF.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Typography, Button, CircularProgress, Alert, Card, CardContent, Box } from '@mui/material';

const GenerarPDF = () => {
  const { id_convocatoria } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const generarPDF = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 1. Obtener datos completos de la convocatoria
      const response = await axios.get(
        `http://localhost:5000/convocatorias/${id_convocatoria}`,
        { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
      );
      
      const convocatoriaData = response.data;
      
      // 2. Generar el PDF
      const pdfResponse = await axios.post(
        `http://localhost:5000/pdf/${id_convocatoria}/generar`,
        convocatoriaData,
        {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          responseType: 'blob'
        }
      );
      
      // 3. Mostrar el PDF generado
      const pdfBlob = new Blob([pdfResponse.data], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');
      
      setSuccess('PDF generado exitosamente');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al generar el PDF');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Generar PDF de Convocatoria
          </Typography>
          
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
            <Button 
              variant="contained" 
              onClick={generarPDF}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Generar PDF'}
            </Button>
            
            <Button 
              variant="outlined" 
              onClick={() => navigate(`/convocatorias/${id_convocatoria}`)}
            >
              Volver a la Convocatoria
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default GenerarPDF;