import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const PDFViewer = () => {
  const { id_convocatoria } = useParams();
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCombinedPDF = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/pdf/combinado/${id_convocatoria}`, {
          responseType: 'blob',
        });
        const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
        const pdfUrl = URL.createObjectURL(pdfBlob);
        setPdfUrl(pdfUrl);
      } catch (error) {
        console.error('Error obteniendo el PDF combinado:', error);
        setError('Error al cargar el PDF combinado.');
      } finally {
        setLoading(false);
      }
    };

    fetchCombinedPDF();

    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl); 
    };
  }, [id_convocatoria]);

  return (
    <div>
      {loading ? (
        <p>Cargando PDF combinado...</p>
      ) : error ? (
        <p>{error}</p>
      ) : pdfUrl ? (
        <iframe src={pdfUrl} width="100%" height="600px" title="Vista previa PDF Combinado"></iframe>
      ) : (
        <p>No se pudo cargar el PDF combinado.</p>
      )}
    </div>
  );
};

export default PDFViewer;
