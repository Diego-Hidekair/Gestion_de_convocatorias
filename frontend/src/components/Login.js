// frontend/src/components/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Mantén tu archivo CSS

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
            const { token, user_id } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user_id', user_id);
            setAuth(true);
            navigate('/redirect');
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
        }
    };

    return (
        <div className="login-wrapper"> 
            <div className="card">
                <form onSubmit={handleSubmit} className="box">
                    <h1>Ingreso</h1>
                    <p className="text-muted">Por favor ingresa el usuario y Contraseña</p>
                    <input 
                        type="text" 
                        name="id" 
                        placeholder="ID" 
                        value={formData.id} 
                        onChange={handleChange} 
                        required 
                    />
                    <input 
                        type="password" 
                        name="Contraseña" 
                        placeholder="Password" 
                        value={formData.Contraseña} 
                        onChange={handleChange} 
                        required 
                    />
                    <input type="submit" value="Login" />
                </form>
            </div>
        </div>
    );
};

export default Login;
