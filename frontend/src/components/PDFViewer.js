// frontend/src/components/PDFViewer.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const PDFViewer = () => {
  const { fileName } = useParams();
  const [pdfUrl, setPdfUrl] = useState('');

  useEffect(() => {
    const fetchPdf = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/pdf/view/${fileName}`, {
          responseType: 'blob'
        });
        const url = URL.createObjectURL(new Blob([response.data]));
        setPdfUrl(url);
      } catch (error) {
        console.error('Error al obtener el PDF:', error);
      }
    };

    fetchPdf();

    // Limpiar el URL del blob al desmontar el componente
    return () => {
      URL.revokeObjectURL(pdfUrl);
    };
  }, [fileName, pdfUrl]);

  return (
    <div>
      {pdfUrl ? (
        <iframe
          src={pdfUrl}
          width="100%"
          height="800px"
          title="PDF Viewer"
        />
      ) : (
        <p>Cargando PDF...</p>
      )}
    </div>
  );
};

export default PDFViewer;
