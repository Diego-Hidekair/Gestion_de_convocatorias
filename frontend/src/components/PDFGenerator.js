// frontend/src/components/PDFGenerator.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Container,
    Typography,
    Button,
    CircularProgress,
    Box,
    Paper,
    Input,
    FormControl,
    FormLabel,
    Alert,
} from '@mui/material';

const PDFGenerator = () => {
    const { id_convocatoria, id_honorario } = useParams();
    const [pdfUrl, setPdfUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null); // Estado para el mensaje de éxito
    const [archivos, setArchivos] = useState({
        resolucion: null,
        dictamen: null,
        carta: null,
        nota: null,
        certificado_item: null,
        certificado_resumen_presupuestario: null,
    });
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
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
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
        const formData = new FormData();

        // Agregar archivos al FormData si están presentes
        for (const key in archivos) {
            if (archivos[key]) {
                formData.append(key, archivos[key]);
            }
        }

        try {
            const response = await axios.post(
                `http://localhost:5000/pdf/combinar-y-guardar/${id_convocatoria}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            if (response.status === 201) {
                setSuccessMessage('Documentos subidos y combinados correctamente.'); // Mostrar mensaje de éxito
                await cargarPDF(); // Recargar el PDF combinado
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
    }, [id_convocatoria, id_honorario, token, cargarPDF, generarPDF]);

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
            <Container>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                    <CircularProgress />
                    <Typography variant="body1" style={{ marginLeft: '10px' }}>
                        Generando y cargando PDF...
                    </Typography>
                </Box>
            </Container>
        );
    }

    return (
        <Container>
            <Typography variant="h4" align="center" gutterBottom>
                Vista previa del PDF
            </Typography>

            {successMessage && (
                <Alert severity="success" style={{ marginBottom: '20px' }}>
                    {successMessage}
                </Alert>
            )}

            {pdfUrl ? (
                <Paper elevation={3} style={{ padding: '20px', marginBottom: '20px' }}>
                    <iframe
                        title="Vista previa del PDF"
                        src={pdfUrl}
                        width="100%"
                        height="600px"
                        style={{ border: 'none' }}
                    />
                </Paper>
            ) : (
                <Typography variant="body1" align="center">
                    No se pudo cargar el PDF.
                </Typography>
            )}

            <Paper elevation={3} style={{ padding: '20px', marginBottom: '20px' }}>
                <form onSubmit={handleSubirArchivos}>
                    {Object.keys(archivos).map((key) => (
                        <FormControl fullWidth key={key} style={{ marginBottom: '20px' }}>
                            <FormLabel>{key.replace(/_/g, ' ').toUpperCase()}</FormLabel>
                            <Input
                                type="file"
                                onChange={(e) => setArchivos({ ...archivos, [key]: e.target.files[0] })}
                                inputProps={{ accept: '.pdf' }}
                            />
                        </FormControl>
                    ))}
                    <Button type="submit" variant="contained" color="primary" fullWidth>
                        Subir Archivos
                    </Button>
                </form>
            </Paper>

            <Box display="flex" justifyContent="space-between" marginBottom="20px">
                <Button variant="contained" color="secondary" onClick={handleDescargarPDF}>
                    Descargar PDF
                </Button>
                <Button variant="contained" color="primary" onClick={handleTerminar}>
                    Terminar
                </Button>
            </Box>
        </Container>
    );
};

export default PDFGenerator;