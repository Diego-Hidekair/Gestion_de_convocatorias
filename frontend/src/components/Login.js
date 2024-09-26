// frontend/src/components/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../Global.css';  // Importa Global.css


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
            const { token, userId } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('userId', userId); // Asegúrate de que esto sea correcto
            setAuth(true);
            navigate('/redirect');
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
        }
    };

    return (
        <div className="container-fluid">
            <div className="row no-gutter">
                <div className="col-md-6 d-none d-md-flex bg-image"></div>
                <div className="col-md-6 bg-light">
                    <div className="login d-flex align-items-center py-5">
                        <div className="container">
                            <div className="row">
                                <div className="col-lg-7 col-xl-6 mx-auto">
                                    <h3 className="display-4">Acceso</h3>
                                    <form onSubmit={handleSubmit}>
                                        <div className="form-group mb-3">
                                            <input 
                                                type="text" 
                                                name="id" 
                                                placeholder="ID" 
                                                value={formData.id} 
                                                onChange={handleChange} 
                                                required 
                                                className="form-control rounded-pill border-0 shadow-sm px-4"
                                            />
                                        </div>
                                        <div className="form-group mb-3">
                                            <input 
                                                type="password" 
                                                name="Contraseña" 
                                                placeholder="Password" 
                                                value={formData.Contraseña} 
                                                onChange={handleChange} 
                                                required 
                                                className="form-control rounded-pill border-0 shadow-sm px-4 text-danger"
                                            />
                                        </div>
                                        
                                        <button 
                                            type="submit" 
                                            className="btn btn-danger btn-block text-uppercase mb-2 rounded-pill shadow-sm"
                                        >
                                            Ingresar
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
