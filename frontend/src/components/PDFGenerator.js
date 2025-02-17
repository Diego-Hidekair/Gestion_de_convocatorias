// frontend/src/components/PDFGenerator.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spinner } from 'reactstrap';
import axios from 'axios';
import '../styles/pdf.css'; 

const PDFGenerator = () => {
    const { id_convocatoria, id_honorario } = useParams();
    const [pdfUrl, setPdfUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [archivosAdicionales, setArchivosAdicionales] = useState([]);
    const navigate = useNavigate();

    const token = localStorage.getItem('token');
    if (!token) {
        console.error('Token no disponible. Redirigiendo al login.');
        navigate('/login');
    }

    const generarPDF = async () => {
        try {
            const response = await axios.get(
                `http://localhost:5000/pdf/generar/${id_convocatoria}/${id_honorario}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.status === 201) {
                console.log('PDF generado correctamente.');
            } else {
                setError('Error al generar el PDF. Inténtalo de nuevo.');
            }
        } catch (error) {
            console.error('Error al generar el PDF:', error.message);
            setError('Error al generar el PDF. Verifica tu conexión o intenta más tarde.');
        }
    };

    const cargarPDF = async () => {
        try {
            const response = await axios.get(
                `http://localhost:5000/pdf/combinado/ver/${id_convocatoria}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
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
            console.error('Error al cargar el PDF:', error.message);
            setError('Error al cargar el PDF. Verifica tu conexión o intenta más tarde.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubirArchivos = async (e) => {
        e.preventDefault();
    
        // Verifica que haya archivos para subir
        if (archivosAdicionales.length === 0) {
            setError('No se han seleccionado archivos para subir.');
            return;
        }
    
        const formData = new FormData();
        archivosAdicionales.forEach((archivo) => {
            formData.append('archivos', archivo); // Asegúrate de que el nombre 'archivos' coincida con el esperado en el backend
        });
    
        try {
            const response = await axios.post(
                `http://localhost:5000/pdf/combinar-y-guardar/${id_convocatoria}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data', // Importante para enviar archivos
                    },
                }
            );
    
            if (response.status === 201) {
                console.log('Documentos adicionales subidos y combinados correctamente.');
                navigate(`/pdf/combinado/${id_convocatoria}`); 
            } else {
                setError('Error al subir documentos adicionales.');
            }
        } catch (error) {
            console.error('Error al subir documentos adicionales:', error.message);
            setError('Error al subir documentos adicionales. Verifica tu conexión o intenta más tarde.');
        }
    };

    useEffect(() => {
        const iniciarProceso = async () => {
            setLoading(true);
            await generarPDF();
            await cargarPDF();
        };

        iniciarProceso();
    }, [id_convocatoria, id_honorario, token]);

    const handleDescargarPDF = async () => {
        try {
            const response = await axios.get(
                `http://localhost:5000/pdf/descargar/${id_convocatoria}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    responseType: 'blob',
                }
            );
            const link = document.createElement('a');
            link.href = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            link.download = 'documento.pdf';
            link.click();
        } catch (error) {
            console.error('Error descargando el PDF:', error.message);
            setError('Error al descargar el PDF.');
        }
    };

    const handleTerminar = () => {
        navigate('/convocatorias');
    };

    if (loading) {
        return (
            <div className="loading-container">
                <Spinner color="primary" />
                <p>Generando y cargando PDF...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <p className="error-message">{error}</p>
                <button className="retry-button" onClick={() => window.location.reload()}>
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <div className="pdf-generator-container">
            <h1 className="pdf-generator-title">Vista previa del PDF</h1>
            <div className="pdf-layout">
                <div className="pdf-preview-container">
                    {pdfUrl ? (
                        <iframe title="Vista previa del PDF" src={pdfUrl} className="pdf-preview"></iframe>
                    ) : (
                        <p>No se pudo cargar el PDF.</p>
                    )}
                </div>
                <div className="upload-section">
                    <form onSubmit={handleSubirArchivos}>
                        <h2>Subir Documentos Adicionales</h2>
                        <input
                            type="file"
                            multiple
                            onChange={(e) => setArchivosAdicionales([...e.target.files])}
                        />
                        <button type="submit">Subir Documentos</button>
                    </form>
                    <div className="button-group">
                        <button className="download-button" onClick={handleDescargarPDF}>
                            Descargar PDF
                        </button>
                        <button className="finish-button" onClick={handleTerminar}>
                            Terminar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PDFGenerator;
