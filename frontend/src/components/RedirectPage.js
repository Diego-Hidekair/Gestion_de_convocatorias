// frontend/src/components/RedirectPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const RedirectPage = () => {
    const navigate = useNavigate();

    const handleNavigation = (path) => {
        navigate(path);
    };

    return (
        <div className="container-fluid d-flex flex-column justify-content-center align-items-center" style={{ height: '100vh' }}>
            <h1>Selecciona una opción</h1>
            <button onClick={() => handleNavigation('/convocatorias')} className="btn btn-primary m-2">Ir a Convocatorias</button>
            <button onClick={() => handleNavigation('/pdf-generator')} className="btn btn-primary m-2">Generador de PDF</button>
            <button onClick={() => handleNavigation('/convocatorias/convocatorias-estado')} className="btn btn-primary m-2">Estado de Convocatorias</button>
        </div>
    );
};

export default RedirectPage;
