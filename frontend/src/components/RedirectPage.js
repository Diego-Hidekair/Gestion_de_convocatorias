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
            <h1 style={{ color: 'black', border: '5px solid #00639a', padding: '10px', borderRadius: '2rem', }}>
                Bienvenidos a la sección inicial
            </h1>
            <div className="d-flex justify-content-center">
                <button onClick={() => handleNavigation('/convocatorias')} className="btn btn-primary m-2 btn-lg">Ir a Convocatorias</button>
                <button onClick={() => handleNavigation('/usuarios/me')} className="btn btn-primary m-2 btn-lg">Ver Usuario</button>
            </div>
        </div>
    );
};

export default RedirectPage;
