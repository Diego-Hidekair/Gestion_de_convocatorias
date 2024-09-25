// frontend/src/components/UsuarioPerfil.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Card, CardBody } from 'reactstrap';

const UsuarioPerfil = () => {
    const { id } = useParams(); // Obtener el ID del usuario de los parámetros
    const [usuario, setUsuario] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsuario = async () => {
            try {
                const response = await axios.get(`/usuarios/${id}`); // Asegúrate de que esta URL es correcta
                setUsuario(response.data);
            } catch (error) {
                console.error('Error al obtener el usuario', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsuario();
    }, [id]);

    if (loading) return <div>Cargando...</div>;

    if (!usuario) return <div>No se encontró el usuario.</div>;

    return (
        <Card>
            <CardBody>
                <h2>Perfil de Usuario</h2>
                <p>Nombres: {usuario.Nombres}</p>
                <p>Apellido Paterno: {usuario.Apellido_paterno}</p>
                <p>Apellido Materno: {usuario.Apellido_materno}</p>
                <p>Rol: {usuario.Rol}</p>
                <p>Celular: {usuario.Celular}</p>
            </CardBody>
        </Card>
    );
};

export default UsuarioPerfil;

