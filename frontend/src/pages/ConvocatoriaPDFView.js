// frontend/src/pages/ConvocatoriaPDFView.js
import React from 'react';
import { useParams } from 'react-router-dom';

const ConvocatoriaPDFView = () => {
  const { id } = useParams();

  const pdfUrl = `http://192.168.1.11:5000/convocatorias-archivos/view-pdf/${id}`;

  return (
    <div style={{ padding: 20 }}>
      <h2>PDF generado de la convocatoria #{id}</h2>
      <iframe
        src={pdfUrl}
        title="PDF generado"
        width="100%"
        height="800px"
        style={{ border: '1px solid #ccc' }}
      />
    </div>
  );
};

export default ConvocatoriaPDFView;
