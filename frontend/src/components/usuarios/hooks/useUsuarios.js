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

  const fetchUsuarios = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const response = await api.get('/usuarios', {
        params: { page, limit }
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
      const errorMessage = err.response?.data?.error || 
                         (err.response?.status === 401 ? 
                          'No autorizado - Por favor inicie sesión' : 
                          'Error al cargar usuarios');
      
      setError(errorMessage);
      console.error('Error fetching usuarios:', err);
      
      if (err.response?.status === 401) {
        navigate('/login');
      }
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const createUsuario = async (formData) => {
    try {
        setLoading(true);
        setError(null);
        
        const response = await api.post('/usuarios', formData);
        
        return { success: true, data: response.data };
    } catch (error) {
        console.error("Error completo:", error);
        
        let errorMessage = 'Error al crear usuario';
        if (error.response) {
            errorMessage = error.response.data.error || errorMessage;
        }
        
        return { 
            success: false, 
            error: errorMessage,
            details: error.response?.data
        };
    } finally {
        setLoading(false);
    }
};

  const updateUsuario = async (id, formData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.put(`/usuarios/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Actualizar el estado local
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
      
      // Actualizar el estado local
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

  return { usuarios, loading, error, pagination, fetchUsuarios, createUsuario, updateUsuario, deleteUsuario };
};

export default useUsuarios;