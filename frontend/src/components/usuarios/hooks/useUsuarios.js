// src/components/usuarios/hooks/useUsuarios.js
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const useUsuarios = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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
    } catch (err) {
      const errorMessage = err.response?.data?.error || 
                         (err.response?.status === 401 ? 
                          'No autorizado - Por favor inicie sesión' : 
                          'Error al cargar usuarios');
      
      setError(errorMessage);
      console.error('Error fetching usuarios:', err);
      
      // Si es error 401 (no autorizado), podrías redirigir al login
      if (err.response?.status === 401 && shouldRedirect) {
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

const createUsuario = async (usuarioData) => {
    try {
        const formData = new FormData();
        
        // Agregar todos los campos al formData
        Object.keys(usuarioData).forEach(key => {
            if (usuarioData[key] !== undefined && usuarioData[key] !== null) {
                if (key === 'foto_file') {
                    formData.append('foto_perfil', usuarioData[key]);
                } else {
                    formData.append(key, usuarioData[key]);
                }
            }
        });

        const response = await axios.post('/usuarios', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        return { success: true, data: response.data };
    } catch (error) {
        console.error('Error creating usuario:', error);
        return { 
            success: false, 
            error: error.response?.data?.error || 'Error al crear usuario' 
        };
    }
};

  const updateUsuario = async (id, usuarioData) => {
    try {
      setLoading(true);
      const response = await axios.put(`/usuarios/${id}`, usuarioData, {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      await fetchUsuarios();
      return { success: true, data: response.data };
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Error al actualizar usuario';
      setError(errorMsg);
      console.error('Error updating usuario:', error);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const deleteUsuario = async (id) => {
    try {
      setLoading(true);
      await axios.delete(`/usuarios/${id}`, {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      await fetchUsuarios();
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Error al eliminar usuario';
      setError(errorMsg);
      console.error('Error deleting usuario:', error);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  return { usuarios, loading, error, createUsuario, updateUsuario, deleteUsuario, fetchUsuarios};
};