// src/components/usuarios/hooks/useUsuarios.js
import { useState, useEffect } from 'react';
import axios from 'axios';

export const useUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/usuarios', {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      setUsuarios(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar usuarios');
      console.error('Error fetching usuarios:', err);
    } finally {
      setLoading(false);
    }
  };

  const createUsuario = async (formData) => {
    try {
      setLoading(true);
      const response = await axios.post('/usuarios', formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      await fetchUsuarios();
      return { success: true, data: response.data };
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Error al crear usuario';
      setError(errorMsg);
      console.error('Error creating usuario:', error);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
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