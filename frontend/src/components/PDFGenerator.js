// frontend/src/components/PDFGenerator.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spinner } from 'reactstrap';

const PDFGenerator = () => {
  const { idConvocatoria } = useParams();
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (idConvocatoria) {
      setLoading(true);
      console.log('Enviando solicitud para generar PDF con idConvocatoria:', idConvocatoria);
      fetch(`/pdf/generar/${idConvocatoria}`)
        .then((response) => {
          console.log('Respuesta del servidor:', response);
          if (!response.ok) {
            throw new Error('Error al generar el PDF');
          }
          return response.json();
        })
        .then((data) => {
          console.log('Datos recibidos:', data);
          if (data.pdfPath) {
            setPdfUrl(data.pdfPath); // Usa pdfPath para el visor del PDF
            setLoading(false);
            // Redirige al componente PDFViewer si es necesario
            navigate(`/pdf/view/${data.pdfFileName}`); // Cambia esto según tu lógica
          } else {
            throw new Error('PDF no encontrado');
          }
        })
        .catch((error) => {
          console.error('Error:', error);
          setError('No se pudo generar el PDF');
          setLoading(false);
        });
    }
  }, [idConvocatoria, navigate]);

  const handleFileUpload = (e, field) => {
    const file = e.target.files[0];
    console.log(`Subiendo archivo para: ${field}`, file);
  };

  const handleGenerateDocument = async () => {
    console.log('Generando documento...');

    // Aquí manejas la subida de los archivos
    const formData = new FormData();
    const resolucionFile = document.querySelector('input[type="file"][name="resolucion"]').files[0];
    const dictamenFile = document.querySelector('input[type="file"][name="dictamen"]').files[0];
    const otrosDocumentosFile = document.querySelector('input[type="file"][name="otros_documentos"]').files[0];

    if (resolucionFile) formData.append('resolucion', resolucionFile);
    if (dictamenFile) formData.append('dictamen', dictamenFile);
    if (otrosDocumentosFile) formData.append('otros_documentos', otrosDocumentosFile);

    // Supongamos que tienes un endpoint para manejar esto
    await fetch('http://localhost:5000/pdf/unir', { // Cambia esta URL si es necesario
      method: 'POST',
      body: formData,
    })
    .then(response => response.json())
    .then(data => {
      console.log('Documentos unidos y PDF generado:', data);
      // Aquí puedes redirigir al PDF generado si es necesario
    })
    .catch(error => {
      console.error('Error al unir documentos:', error);
    });
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
