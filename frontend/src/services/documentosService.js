// frontend/src/services/documentosService.js
import axios from 'axios';

const API_URL = 'http://localhost:4000/documentos';

// Crear un nuevo documento
export const createDocumento = async (data) => {
    try {
        const response = await axios.post(API_URL, data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error al crear documento:', error);
        throw error;
    }
};

// Obtener todos los documentos
export const getDocumentos = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        console.error('Error al obtener documentos:', error);
        throw error;
    }
};

// Subir un documento adicional
export const subirDocumentoAdicional = async (data) => {
    try {
        const response = await axios.post(`${API_URL}/adicional`, data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error al subir documento adicional:', error);
        throw error;
    }
};

// Obtener documentos adicionales por convocatoria
export const obtenerDocumentosAdicionalesPorConvocatoria = async (idConvocatoria) => {
    try {
        const response = await axios.get(`${API_URL}/adicional/${idConvocatoria}`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener documentos adicionales:', error);
        throw error;
    }
};
