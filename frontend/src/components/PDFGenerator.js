// frontend/src/components/PDFGenerator.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spinner } from 'reactstrap';

const PDFGenerator = () => {
  const { id_convocatoria } = useParams();
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (id_convocatoria) {
      setLoading(true);
      fetch(`http://localhost:5000/pdf/generar/${id_convocatoria}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.pdfPath) {
            setPdfUrl(data.pdfPath);  // Debe recibir algo como "/pdfs/convocatoria_X.pdf"
          } else {
            throw new Error('PDF no encontrado');
          }
        })
        .catch((error) => {
          console.error('Error:', error);
          setError('No se pudo generar el PDF');
        })
        .finally(() => setLoading(false));
    }
  }, [id_convocatoria]);

  const handleFileUpload = (e, field) => {
    const file = e.target.files[0];
    console.log(`Subiendo archivo para: ${field}`, file);
  };

  const handleGenerateDocument = async () => {
    console.log('Generando documento...');

    const formData = new FormData();
    const resolucionFile = document.querySelector('input[type="file"][name="resolucion"]').files[0];
    const dictamenFile = document.querySelector('input[type="file"][name="dictamen"]').files[0];
    const otrosDocumentosFile = document.querySelector('input[type="file"][name="otros_documentos"]').files[0];

    if (resolucionFile) formData.append('resolucion', resolucionFile);
    if (dictamenFile) formData.append('dictamen', dictamenFile);
    if (otrosDocumentosFile) formData.append('otros_documentos', otrosDocumentosFile);

    try {
      const response = await fetch('http://localhost:5000/pdf/unir', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      console.log('Documentos unidos y PDF generado:', data);

      // Redirigir a la vista del PDF combinado
      if (data.pdfFileName) {
        navigate(`/pdf/view/${data.pdfFileName}`);
      }
    } catch (error) {
      console.error('Error al unir documentos:', error);
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ flex: 1 }}>
        {loading ? (
          <>
            <Spinner color="primary" size="sm">Loading...</Spinner>
            <Spinner color="primary" size="sm" type="grow">Loading...</Spinner>
          </>
        ) : error ? (
          <p>{error}</p>
        ) : pdfUrl ? (
          <iframe src={pdfUrl} width="100%" height="500px" title="Vista previa PDF"></iframe>
        ) : (
          <p>No se pudo cargar el PDF.</p>
        )}
      </div>
      <div style={{ flex: 1, marginLeft: '20px' }}>
        <h3>Subir documentos</h3>
        <div>
          <label>Subir Resolución:</label>
          <input type="file" name="resolucion" onChange={(e) => handleFileUpload(e, 'resolucion')} />
        </div>
        <div style={{ marginTop: '10px' }}>
          <label>Subir Dictamen:</label>
          <input type="file" name="dictamen" onChange={(e) => handleFileUpload(e, 'dictamen')} />
        </div>
        <div style={{ marginTop: '10px' }}>
          <label>Otros Documentos:</label>
          <input type="file" name="otros_documentos" onChange={(e) => handleFileUpload(e, 'otros_documentos')} />
        </div>
        <div style={{ marginTop: '20px' }}>
          <button onClick={handleGenerateDocument}>Generar Documento</button>
        </div>
      </div>
    </div>
  );
};

export default PDFGenerator;
