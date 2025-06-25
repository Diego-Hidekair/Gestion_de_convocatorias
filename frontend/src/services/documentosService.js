// frontend/src/services/documentosService.js
import api from '../config/axiosConfig';

const endpoint = '/documentos';

export const createDocumento = async (data) => {
    try {
        const response = await api.post(endpoint, data, {
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

export const getDocumentos = async () => {
    try {
        const response = await api.get(endpoint);
        return response.data;
    } catch (error) {
        console.error('Error al obtener documentos:', error);
        throw error;
    }
};

export const subirDocumentoAdicional = async (data) => {
    try {
        const response = await api.post(`${endpoint}/adicional`, data, {
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

export const obtenerDocumentosAdicionalesPorConvocatoria = async (idConvocatoria) => {
    try {
        const response = await api.get(`${endpoint}/adicional/${idConvocatoria}`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener documentos adicionales:', error);
        throw error;
    }
};
