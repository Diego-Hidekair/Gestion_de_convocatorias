// frontend/src/components/PDFGenerator.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spinner } from 'reactstrap';
import axios from 'axios';
import '../styles/pdf.css';

const PDFGenerator = () => {
  const { id_convocatoria, id_honorario } = useParams();
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Obtén el token de localStorage
  const token = localStorage.getItem('token');

  useEffect(() => {
    const generarPDF = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/pdf/generar/${id_convocatoria}/${id_honorario}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: 'blob', // Aseguramos que el PDF sea recibido como archivo
        });
        if (response.status === 200) {
          const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
          const pdfUrl = URL.createObjectURL(pdfBlob);
          setPdfUrl(pdfUrl);
          setLoading(false);
        } else {
          console.error('Error generando PDF:', response.data);
          setError(response.data.error || 'Error al generar el PDF.');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error generando el PDF:', error.message);
        setError('Error al generar el PDF.');
        setLoading(false);
      }
    };
        /*if (response.status === 200) {
          console.log('PDF generado correctamente');
        } else {
          console.error('Error generando PDF:', response.data);
          setError(response.data.error || 'Error al generar el PDF.');
        }
      } catch (error) {
        console.error('Error generando el PDF:', error.message);
        setError('Error al generar el PDF.');
      }
    };*/
  generarPDF();
}, [id_convocatoria, id_honorario, token]);

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
      <button className="finish-button" onClick={handleTerminar}>
        Terminar
      </button>
    </div>
  );
};

export default PDFGenerator;