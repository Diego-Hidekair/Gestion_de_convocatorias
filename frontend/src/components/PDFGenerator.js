// frontend/src/components/PDFGenerator.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spinner } from 'reactstrap';
import axios from 'axios';
import '../styles/pdf.css'; 

const PDFGenerator = () => {
  const { id_convocatoria, id_honorario } = useParams();
  const [pdfUrl] = useState(null);
  const [loading] = useState(true);
  const [error, setError] = useState(null);
  const [files, setFiles] = useState({ resolucion: null, dictamen: null, carta: null });
  const navigate = useNavigate();

  // Obtén el token de localStorage
  const token = localStorage.getItem('token');

  useEffect(() => {
    
    const generarPDF = async () => {
      try {
          const response = await axios.get(`http://localhost:5000/pdf/generar/${id_convocatoria}/${id_honorario}`);
          if (response.status === 200) {
              console.log('PDF generado correctamente');
          } else {
              console.error('Error generando PDF:', response.data);
          }
      } catch (error) {
          console.error('Error generando el PDF:', error.message);
      }
  };
  generarPDF();
  }, [id_convocatoria, id_honorario, token]);


  const handleFileUpload = (e) => {
    const { name, files: selectedFiles } = e.target;
    setFiles((prevFiles) => ({ ...prevFiles, [name]: selectedFiles[0] }));
  };

  const handleGenerateDocument = async () => {
    const formData = new FormData();
    if (files.resolucion) formData.append('resolucion_path', files.resolucion);
    if (files.dictamen) formData.append('dictamen_path', files.dictamen);
    if (files.carta) formData.append('carta_path', files.carta);

    try {
      // Combinar documentos
      await axios.post(`http://localhost:5000/pdf/combinar/${id_convocatoria}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`, // Incluye el token en el encabezado
        },
      });
      console.log('PDF combinado correctamente.');
      navigate(`/pdf/combinado/${id_convocatoria}`);
    } catch (error) {
      console.error('Error combinando el PDF:', error);
      setError('Error al combinar el PDF.');
    }
  };

  if (loading) {
    return <Spinner color="primary" />;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="pdf-generator-container">
      <div className="upload-form">
        <h1 className="pdf-generator-title">Generador y combinador de PDF</h1>
        <label>
          Resolución:
          <input type="file" name="resolucion" onChange={handleFileUpload} />
        </label>
        <label>
          Dictamen:
          <input type="file" name="dictamen" onChange={handleFileUpload} />
        </label>
        <label>
          Otros Documentos:
          <input type="file" name="carta" onChange={handleFileUpload} />
        </label>
        <button onClick={handleGenerateDocument}>Generar Documento Final</button>
      </div>
      <div className="pdf-preview-container">
        <iframe title="Vista previa del PDF" src={pdfUrl} className="pdf-preview"></iframe>
      </div>
    </div>
  );
};

export default PDFGenerator;