// frontend/src/components/FileUpload.js
import React, { useState } from 'react';
import axios from 'axios';

const FileUpload = () => {
  const [resolucion, setResolucion] = useState('');
  const [dictamen, setDictamen] = useState('');
  const [documento, setDocumento] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('resolucion', resolucion);
    formData.append('dictamen', dictamen);
    formData.append('documento', documento);

    try {
      const response = await axios.post('http://localhost:5000/api/documentos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Archivo subido exitosamente:', response.data);
    } catch (error) {
      console.error('Error al subir el archivo:', error);
    }
  };

  return (
    <form className="container" onSubmit={handleSubmit}>
      <div>
        <label>Resolución:</label>
        <input
          type="text"
          value={resolucion}
          onChange={(e) => setResolucion(e.target.value)}
        />
      </div>
      <div>
        <label>Dictamen:</label>
        <input
          type="text"
          value={dictamen}
          onChange={(e) => setDictamen(e.target.value)}
        />
      </div>
      <div>
        <label>Documento:</label>
        <input
          type="file"
          onChange={(e) => setDocumento(e.target.files[0])}
        />
      </div>
      <button type="submit">Subir</button>
    </form>
  );
};

export default FileUpload;
