import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Spinner } from 'reactstrap'; // Asegúrate de tener instalada esta librería

const PDFGenerator = () => {
  const { idConvocatoria } = useParams();
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true); // Estado de carga

  useEffect(() => {
    if (idConvocatoria) {
      setLoading(true); // Activar el estado de carga
      // Obtener la URL del PDF generado
      fetch(`/pdf/generar/${idConvocatoria}`)
        .then((response) => response.json())
        .then((data) => {
          setPdfUrl(data.pdfPath);
          setLoading(false); // Desactivar el estado de carga
        })
        .catch((error) => {
          console.error('Error:', error);
          setLoading(false); // Desactivar el estado de carga en caso de error
        });
    }
  }, [idConvocatoria]);

  const handleFileUpload = (e, field) => {
    // Lógica para subir cada archivo correspondiente (resolución, dictamen, otros documentos)
    const file = e.target.files[0];
    console.log(`Subiendo archivo para: ${field}`, file);
  };

  const handleGenerateDocument = () => {
    // Lógica para generar el documento final
    console.log('Generando documento...');
  };

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ flex: 1 }}>
        {loading ? (
          <>
            <Spinner color="primary" size="sm">Loading...</Spinner>
            <Spinner color="primary" size="sm" type="grow">Loading...</Spinner>
          </>
        ) : pdfUrl ? (
          <iframe src={pdfUrl} width="100%" height="500px" title="Vista previa PDF"></iframe>
        ) : (
          <p>No se pudo cargar el PDF.</p>
        )}
      </div>
      <div style={{ flex: 1, marginLeft: '20px' }}>
        <h3>Subir documentos</h3>

        {/* Subir Resolución */}
        <div>
          <label>Subir Resolución:</label>
          <input type="file" onChange={(e) => handleFileUpload(e, 'resolucion')} />
        </div>

        {/* Subir Dictamen */}
        <div style={{ marginTop: '10px' }}>
          <label>Subir Dictamen:</label>
          <input type="file" onChange={(e) => handleFileUpload(e, 'dictamen')} />
        </div>

        {/* Otros Documentos */}
        <div style={{ marginTop: '10px' }}>
          <label>Otros Documentos:</label>
          <input type="file" onChange={(e) => handleFileUpload(e, 'otros_documentos')} />
        </div>

        {/* Botón para generar el documento */}
        <div style={{ marginTop: '20px' }}>
          <button onClick={handleGenerateDocument}>Generar Documento</button>
        </div>
      </div>
    </div>
  );
};

export default PDFGenerator;
