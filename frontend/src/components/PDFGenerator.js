// frontend/src/components/PDFGenerator.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const PDFGenerator = () => {
  const { idConvocatoria, idMateria } = useParams(); // Obtener ambos parámetros desde la URL
  const [pdfUrl, setPdfUrl] = useState(null);

  useEffect(() => {
    if (idConvocatoria) {
      // Obtener la URL del PDF generado
      fetch(`/pdf/generar/${idConvocatoria}`)
        .then((response) => response.json())
        .then((data) => {
          setPdfUrl(data.pdfPath);
        })
        .catch((error) => console.error('Error:', error));
    }
  }, [idConvocatoria]);

  const handleFileUpload = (e) => {
    // Lógica para subir el resto de los documentos
  };

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ flex: 1 }}>
        {pdfUrl ? (
          <iframe src={pdfUrl} width="100%" height="500px" title="Vista previa PDF"></iframe>
        ) : (
          <p>Cargando vista previa...</p>
        )}
      </div>
      <div style={{ flex: 1 }}>
        <h3>Subir documentos</h3>
        <input type="file" onChange={handleFileUpload} />
        {/* Aquí puedes agregar otros campos para subir resolución, dictamen, etc. */}
      </div>
    </div>
  );
};

export default PDFGenerator;
