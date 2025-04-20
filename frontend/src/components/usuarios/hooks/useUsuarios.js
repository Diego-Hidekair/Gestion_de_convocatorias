// src/components/usuarios/hooks/useUsuarios.js
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const useUsuarios = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const navigate = useNavigate();

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      const response = await axios.get('/usuarios', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }); 
      
      setUsuarios(response.data);
      return { success: true, data: response.data };
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
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
  
      // Convertir FormData a objeto para logging
      const formDataObj = {};
      for (let [key, value] of formData.entries()) {
        formDataObj[key] = value;
      }
      console.log('Datos enviados:', formDataObj);
  
      const response = await axios.post('/usuarios', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
        transformRequest: (data, headers) => {
          // Eliminar Content-Type automático para que Axios lo establezca correctamente
          delete headers['Content-Type'];
          return data;
        }
      });
  
      return { success: true, data: response.data };
    } catch (error) {
      const errorData = error.response?.data || {};
      console.error('Error completo:', {
        status: error.response?.status,
        data: errorData,
        headers: error.response?.headers
      });
      
      const errorMsg = errorData.error || 
                      errorData.message || 
                      'Error al crear usuario';
      
      return { 
        success: false, 
        error: errorMsg,
        details: errorData.details
      };
    } finally {
      setLoading(false);
    }
  };

  const updateUsuario = async (id, usuarioData) => {
    try {
      setLoading(true);
      setError(null);    
      const formData = new FormData();
      
      Object.keys(usuarioData).forEach(key => {
        if (usuarioData[key] !== undefined && usuarioData[key] !== null) {
          if (key === 'foto_file') {
            formData.append('foto_perfil', usuarioData[key]);
          } else {
            formData.append(key, usuarioData[key]);
          }
        }
      });
      
      const response = await axios.put(`/usuarios/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error updating usuario:', error);
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
      
      await axios.delete(`/usuarios/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting usuario:', error);
      const errorMsg = error.response?.data?.error || 'Error al eliminar usuario';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  return { usuarios, loading, error, fetchUsuarios, createUsuario, updateUsuario, deleteUsuario };
};

export default useUsuarios;