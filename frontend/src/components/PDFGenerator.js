// frontend/src/components/PDFGenerator.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spinner } from 'reactstrap';
import axios from 'axios';
import '../styles/pdf.css';

const PDFGenerator = () => {
  const { id_convocatoria } = useParams(); // Eliminamos id_honorario si no es necesario aquí
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  useEffect(() => {
    const cargarPDF = async () => {
        try {
            console.log(`Cargando PDF para id_convocatoria: ${id_convocatoria}`);
            const response = await axios.get(
                `http://localhost:5000/pdf/combinado/ver/${id_convocatoria}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    responseType: 'blob',
                }
            );
        if (response.status === 200) {
                console.log('PDF cargado correctamente');
                const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
                const pdfUrl = URL.createObjectURL(pdfBlob);
                setPdfUrl(pdfUrl);
            } else {
                console.error('Error al cargar PDF:', response.data);
                setError(response.data.error || 'Error al cargar el PDF.');
            }
        } catch (error) {
            console.error('Error al cargar el PDF:', error.message);
            setError('Error al cargar el PDF.');
        } finally {
            setLoading(false);
        }
    };

    cargarPDF();
}, [id_convocatoria, token]);

  const handleDescargarPDF = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/pdf/descargar/${id_convocatoria}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: 'blob',
        }
      );
      const link = document.createElement('a');
      link.href = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      link.download = 'documento.pdf';
      link.click();
    } catch (error) {
      console.error('Error descargando el PDF:', error.message);
      setError('Error al descargar el PDF.');
    }
  };

  const handleTerminar = () => {
    navigate('/convocatorias'); // Redirige a la página de convocatorias
  };

  if (loading) {
    return <Spinner color="primary" />;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="pdf-generator-container">
      <h1 className="pdf-generator-title">Vista previa del PDF</h1>
      {pdfUrl ? (
        <div className="pdf-preview-container">
          <iframe title="Vista previa del PDF" src={pdfUrl} className="pdf-preview"></iframe>
        </div>
      ) : (
        <p>No se pudo cargar el PDF.</p>
      )}
      <div className="button-group">
        <button className="download-button" onClick={handleDescargarPDF}>
          Descargar PDF
        </button>
        <button className="finish-button" onClick={handleTerminar}>
          Terminar
        </button>
      </div>
    </div>
  );
};

export default PDFGenerator;
