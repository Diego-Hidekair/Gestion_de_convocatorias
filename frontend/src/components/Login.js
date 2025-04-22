// frontend/src/components/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';

axios.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
  
  axios.interceptors.response.use(
    response => response,
    error => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

const Login = ({ setAuth }) => {
    const [formData, setFormData] = useState({
        id_usuario: '',
        Contrasena: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', {
                id_usuario: formData.id_usuario,
                contrasena: formData.Contrasena 
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const { token, userId, rol } = response.data;
            
            localStorage.setItem('token', token);
            localStorage.setItem('userId', userId);
            localStorage.setItem('rol', rol);
            
            setAuth(true);
            
            // Redirección basada en roles
            const redirectPaths = {
                'admin': '/usuarios',
                'personal_administrativo': '/solicitudes',
                'secretaria_de_decanatura': '/convocatorias',
                'tecnico_vicerrectorado': '/convocatorias',
                'vicerrectorado': '/reportes'
            };
            
            navigate(redirectPaths[rol] || '/perfil');
            
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            const errorMessage = error.response?.data?.error || 
                                (error.response?.status === 500 ? 
                                 'Error en el servidor' : 
                                 'Credenciales incorrectas');
            setError(errorMessage);
        }
    };

    return (
        <>
            <div className="top-bar">
                <img src="/imagenes/LOG-fd8360d8.png" alt="Logo" className="logo" />
            </div>
            <footer className="login-footer">
                ©-UATF-2024-Diego-Fajardo
            </footer>
            <div className="login-page">
                <div className="login-container">
                    <div className="login-form-container">
                        <div className="login-title-container">
                            <h2 className="login-title">LOGIN</h2>
                        </div>
                        {error && (
                            <div className="alert alert-danger mb-3">
                                {error}
                            </div>
                        )}
                        <form onSubmit={handleSubmit}>
                            <div className="form-group-login">
                                <input 
                                    type="text" 
                                    name="id_usuario" 
                                    placeholder="ID de Usuario" 
                                    value={formData.id_usuario} 
                                    onChange={handleChange} 
                                    required 
                                    className="form-control" 
                                />
                            </div>
                            <div className="form-group-login">
                                <input 
                                    type="password" 
                                    name="Contrasena" 
                                    placeholder="Contrasena" 
                                    value={formData.contrasena} 
                                    onChange={handleChange} 
                                    required 
                                    className="form-control" 
                                />
                            </div>
                            <button 
                                type="submit" 
                                className="btn-login"
                            >
                                Ingresar
                            </button>
                        </form>
                    </div>
                    <div className="login-background-image"></div>
                </div>
            </div>
        </>
    );
};

export default Login;