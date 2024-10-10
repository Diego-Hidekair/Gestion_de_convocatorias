// frontend/src/components/PDFGenerator.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spinner } from 'reactstrap';
import axios from 'axios';

const PDFGenerator = () => {
  const { id_convocatoria, id_honorario } = useParams();
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [files, setFiles] = useState({ resolucion: null, dictamen: null, otrosDocumentos: null });
  const navigate = useNavigate();

  useEffect(() => {
    const generarPDF = async () => {
      try {
        await axios.get(`http://localhost:5000/pdf/generar/${id_convocatoria}/${id_honorario}`);
        setPdfUrl(`http://localhost:5000/pdfs/convocatoria_${id_convocatoria}.pdf`);
        setLoading(false);
      } catch (error) {
        console.error('Error generando el PDF:', error);
        setError('Error al generar el PDF.');
        setLoading(false);
      }
    };

    generarPDF();
  }, [id_convocatoria, id_honorario]);

  const handleFileUpload = (e) => {
    const { name, files: selectedFiles } = e.target;
    setFiles((prevFiles) => ({ ...prevFiles, [name]: selectedFiles[0] }));
  };

  const handleGenerateDocument = async () => {
    const formData = new FormData();
    if (files.resolucion) formData.append('resolucion_path', files.resolucion);
    if (files.dictamen) formData.append('dictamen_path', files.dictamen);
    if (files.otrosDocumentos) formData.append('carta_path', files.otrosDocumentos);  // Asegúrate de que coincida con 'carta_path'

    try {
        const response = await axios.post(`http://localhost:5000/pdf/combinar/${id_convocatoria}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (response.status === 200) {
            // Navegar al visor del PDF combinado
            navigate(`/pdf/view/${id_convocatoria}`);
        } else {
            throw new Error('Error al combinar documentos');
        }
    } catch (error) {
        console.error('Error al combinar documentos:', error);
        setError('Error al combinar documentos.');
    }
};

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ flex: 1 }}>
        {loading ? (
          <Spinner color="primary">Loading...</Spinner>
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
          <input type="file" name="resolucion" onChange={handleFileUpload} />
        </div>
        <div style={{ marginTop: '10px' }}>
          <label>Subir Dictamen:</label>
          <input type="file" name="dictamen" onChange={handleFileUpload} />
        </div>
        <div style={{ marginTop: '10px' }}>
          <label>Otros Documentos:</label>
          <input type="file" name="otrosDocumentos" onChange={handleFileUpload} />
        </div>
        <div style={{ marginTop: '20px' }}>
          <button onClick={handleGenerateDocument}>Generar Documento</button>
        </div>
      </div>
    </div>
  );
};

export default PDFGenerator;