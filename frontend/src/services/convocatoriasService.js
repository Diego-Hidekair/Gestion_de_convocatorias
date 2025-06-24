// services/convocatoriasService.js
import api from './api';

export const getConvocatorias = () => api.get('/convocatorias');