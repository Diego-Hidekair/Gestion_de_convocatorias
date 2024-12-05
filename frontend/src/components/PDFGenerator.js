// frontend/src/components/PDFGenerator.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spinner } from 'reactstrap';
import axios from 'axios';
import '../styles/pdf.css';

const PDFGenerator = () => {
  const { id_convocatoria, id_honorario } = useParams(); // Asegúrate de incluir id_honorario
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  if (!token) {
    console.error('Token no disponible. Redirigiendo al login.');
    navigate('/login'); // Manejo básico de redirección
  }

  useEffect(() => {
    const generarPDF = async () => {
      try {
        console.log(`Generando PDF para id_convocatoria: ${id_convocatoria}, id_honorario: ${id_honorario}`);
        const response = await axios.get(
          `http://localhost:5000/pdf/generar/${id_convocatoria}/${id_honorario}`, // URL corregida
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 201) {
          console.log('PDF generado correctamente.');
        } else {
          console.error('Error al generar el PDF:', response.data.error);
          setError('Error al generar el PDF.');
        }
      } catch (error) {
        console.error('Error al generar el PDF:', error.message);
        setError('Error al generar el PDF.');
      }
    };

    const cargarPDF = async () => {
      try {
        console.log(`Cargando PDF para id_convocatoria: ${id_convocatoria}`);
        const response = await axios.get(
          `http://localhost:5000/pdf/combinado/ver/${id_convocatoria}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            responseType: 'blob',
          }
        );

        if (response.status === 200) {
          const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
          const pdfUrl = URL.createObjectURL(pdfBlob);
          setPdfUrl(pdfUrl);
        } else {
          setError('No se encontró el PDF combinado.');
        }
      } catch (error) {
        console.error('Error al cargar el PDF:', error.message);
        setError('Error al cargar el PDF.');
      } finally {
        setLoading(false);
      }
    };

    const iniciarProceso = async () => {
      setLoading(true);
      await generarPDF();
      await cargarPDF();
    };

    iniciarProceso();
  }, [id_convocatoria, id_honorario, token]);

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
    return <Spinner>Generando y cargando PDF...</Spinner>;
  }

  if (error) {
    return <div className="error">{error}</div>;
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
