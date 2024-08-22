    // frontend/src/components/Login.js
    import React, { useState } from 'react';
    import axios from 'axios';
    import { useNavigate } from 'react-router-dom';
    import './Login.css'; 


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
                const { token, user_id } = response.data; // Asegúrate de que el backend esté devolviendo user_id
                localStorage.setItem('token', token);
                localStorage.setItem('user_id', user_id); // Guarda el user_id en el localStorage
                setAuth(true);
                navigate('/'); // Redirigir a la página principal después de iniciar sesión
            } catch (error) {
                console.error('Error al iniciar sesión:', error);
            }
        };

        /*const handleSubmit = async (e) => {
            e.preventDefault();
            try {
                const response = await axios.post('http://localhost:5000/api/auth/login', formData);
                const { token } = response.data;
                localStorage.setItem('token', token);
                setAuth(true);
                navigate('/'); // Redirigir a la página principal después de iniciar sesión
            } catch (error) {
                console.error('Error al iniciar sesión:', error);
            }
        };*/

        return (
            <div className="login-container">
                <h2>Iniciar Sesión</h2>
                <form onSubmit={handleSubmit}>
                    <input type="text" name="id" placeholder="ID" value={formData.id} onChange={handleChange} required />
                    <input type="password" name="Contraseña" placeholder="Contraseña" value={formData.Contraseña} onChange={handleChange} required />
                    <button type="submit">Iniciar Sesión</button>
                </form>
            </div>
        );
    };

    export default Login;