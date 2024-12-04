// frontend/src/components/PDFViewer.js

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/pdf.css';

const PDFViewer = () => {
  const { id_convocatoria } = useParams();
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
    <div className="pdf-viewer-container">
      <div className="button-section">
        <button onClick={() => navigate(-1)}>Atrás</button>
        <button onClick={() => window.open(pdfUrl, '_blank')}>Guardar PDF</button>
        <button onClick={() => navigate('/convocatorias')}>Terminar</button>
      </div>
      <div className="pdf-preview-container">
        {loading ? ( 
          <p>Cargando PDF combinado...</p>
        ) : error ? (
          <p>{error}</p>
        ) : pdfUrl ? (
          <iframe src={pdfUrl} className="pdf-preview" title="Vista previa PDF Combinado"></iframe>
        ) : (
          <p>No se pudo cargar el PDF combinado.</p>
        )}
      </div>
    </div>
  );
}; 

export default PDFViewer;
