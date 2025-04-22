// src/components/usuarios/hooks/useUsuarios.js
import { useState } from 'react';
import api from '../../../config/axiosConfig';
import { useNavigate } from 'react-router-dom';

const useUsuarios = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });
  const navigate = useNavigate();

  const fetchUsuarios = async (page = 1, limit = 10, search = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/usuarios', {
        params: { 
          page, 
          limit, 
          search,
          timestamp: new Date().getTime() // Evitar caché
        }
      });
      
      setUsuarios(response.data.data);
      setPagination({
        page: response.data.pagination.currentPage,
        limit: response.data.pagination.perPage,
        total: response.data.pagination.total
      });
      
      return { 
        success: true, 
        data: response.data.data,
        pagination: response.data.pagination 
      };
    } catch (err) {
      let errorMessage = 'Error al cargar usuarios';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'No autorizado - Por favor inicie sesión';
          navigate('/login');
        } else if (err.response.data?.error) {
          errorMessage = err.response.data.error;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      console.error('Error fetching usuarios:', err);
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const createUsuario = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      
      if (formData.get('celular') && isNaN(formData.get('celular'))) {
        throw new Error('El celular debe ser un número válido');
      }
      
      const response = await api.post('/usuarios', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        transformRequest: (data, headers) => {
          return data;
        }
      });
      await fetchUsuarios(pagination.page, pagination.limit);
      
      return { 
        success: true, 
        data: response.data,
        message: 'Usuario creado exitosamente'
      };
    } catch (error) {
      console.error("Error al crear usuario:", error);
      
      let errorMessage = 'Error al crear usuario';
      let details = null;
      
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = error.response.data.error || errorMessage;
          if (error.response.data.details) {
            details = error.response.data.details;
          }
        } else if (error.response.status === 409) {
          errorMessage = 'El usuario ya existe';
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { 
        success: false, 
        error: errorMessage,
        details: error.response?.data || details
      };
    } finally {
      setLoading(false);
    }
  };

  const updateUsuario = async (id, formData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.put(`/usuarios/${id}`, formData);
      
      setUsuarios(prev => prev.map(u => 
        u.id_usuario === id ? response.data : u
      ));
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      const errorMsg = error.response?.data?.error || 'Error al actualizar usuario';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };
  
  const deleteUsuario = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      await api.delete(`/usuarios/${id}`);
      
      setUsuarios(prev => prev.filter(u => u.id_usuario !== id));
      
      return { success: true };
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      const errorMsg = error.response?.data?.error || 'Error al eliminar usuario';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  return { usuarios, loading, error, pagination, fetchUsuarios,createUsuario, updateUsuario, deleteUsuario };
};
export default useUsuarios;