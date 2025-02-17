// frontend/src/components/PDFViewer.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/pdf.css';
import { Spinner } from 'reactstrap';

const PDFViewer = () => {
    const { id_convocatoria } = useParams();
    const [pdfUrl, setPdfUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCombinedPDF = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:5000/pdf/combinado/ver/${id_convocatoria}`,
                    {
                        responseType: 'blob',
                    }
                );

                if (response.status === 200) {
                    const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
                    const pdfUrl = URL.createObjectURL(pdfBlob);
                    setPdfUrl(pdfUrl);
                } else {
                    setError('No se encontró el PDF combinado.');
                }
            } catch (error) {
                console.error('Error obteniendo el PDF combinado:', error);
                setError('Error al cargar el PDF combinado.');
            } finally {
                setLoading(false);
            }
        };

        fetchCombinedPDF();

        return () => {
            if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        };
    }, [id_convocatoria]);

    return (
        <div className="pdf-viewer-container">
            <div className="button-group">
                <button onClick={() => navigate(-1)}>Atrás</button>
                <button onClick={() => window.open(pdfUrl, '_blank')}>Guardar PDF</button>
                <button onClick={() => navigate('/convocatorias')}>Terminar</button>
            </div>
            {loading ? (
                <div className="loading-container">
                    <Spinner color="primary" />
                    <p>Cargando PDF combinado...</p>
                </div>
            ) : error ? (
                <p className="error-message">{error}</p>
            ) : pdfUrl ? (
                <iframe src={pdfUrl} className="pdf-preview" title="PDF Combinado"></iframe>
            ) : (
                <p>No se pudo cargar el PDF combinado.</p>
            )}
        </div>
    );
};

export default PDFViewer;