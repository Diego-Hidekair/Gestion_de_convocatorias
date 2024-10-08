// frontend/src/components/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';


axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
); 

const Login = ({ setAuth }) => {
    const [formData, setFormData] = useState({
        id: '',
        Contraseña: ''
    });

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
        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', formData);
            const { token, userId, rol } = response.data; 
            localStorage.setItem('token', token);
            localStorage.setItem('userId', userId);
            localStorage.setItem('rol', rol);
            setAuth(true);
            navigate('/redirect');
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <img src="/imagenes/logo_login.jpg" alt="Logo" className="login-logo" />
                <h3 className="login-title">Acceso</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-group mb-3">
                        <input 
                            type="text" 
                            name="id" 
                            placeholder="ID" 
                            value={formData.id} 
                            onChange={handleChange} 
                            required 
                            className="form-control" 
                        />
                    </div>
                    <div className="form-group mb-3">
                        <input 
                            type="password" 
                            name="Contraseña" 
                            placeholder="Contraseña" 
                            value={formData.Contraseña} 
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
        </div>
        
    );
};

export default Login;
