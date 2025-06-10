// frontend/src/components/convocatorias/ConvocatoriaArchivos/FileUploadForm.js
import React, { useState } from 'react';
import { Button, Form, FormGroup, Label, Input, Alert } from 'reactstrap';
import axios from 'axios';

const FileUploadForm = ({ convocatoriaId, onSuccess, onError }) => {
  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e, field) => {
    setFiles(prev => ({
      ...prev,
      [field]: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    Object.entries(files).forEach(([field, file]) => {
      if (file) {
        formData.append(field, file);
      }
    });

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/convocatorias-archivos/${convocatoriaId}/archivos`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      onSuccess();
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setError(errorMsg);
      if (onError) onError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="mb-4">
      {error && <Alert color="danger">{error}</Alert>}
      
      <FormGroup>
        <Label>Resolución</Label>
        <Input type="file" onChange={(e) => handleFileChange(e, 'resolucion')} />
      </FormGroup>
      
      <FormGroup>
        <Label>Dictamen</Label>
        <Input type="file" onChange={(e) => handleFileChange(e, 'dictamen')} />
      </FormGroup>
      
      <FormGroup>
        <Label>Carta</Label>
        <Input type="file" onChange={(e) => handleFileChange(e, 'carta')} />
      </FormGroup>
      
      <FormGroup>
        <Label>Nota</Label>
        <Input type="file" onChange={(e) => handleFileChange(e, 'nota')} />
      </FormGroup>
      
      <FormGroup>
        <Label>Certificado de Ítem</Label>
        <Input type="file" onChange={(e) => handleFileChange(e, 'certificado_item')} />
      </FormGroup>
      
      <FormGroup>
        <Label>Certificado Presupuestario</Label>
        <Input type="file" onChange={(e) => handleFileChange(e, 'certificado_presupuestario')} />
      </FormGroup>
      
      <Button type="submit" color="primary" disabled={loading}>
        {loading ? 'Subiendo...' : 'Subir Archivos'}
      </Button>
    </Form>
  );
};

export default FileUploadForm;