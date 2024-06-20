import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NavBar from './components/NavBar';
import FacultadForm from './components/FacultadForm';
import FacultadList from './components/FacultadList';
import CarreraForm from './components/CarreraForm';
import CarreraList from './components/CarreraList';
import ConvocatoriaForm from './components/ConvocatoriaForm';
import ConvocatoriaList from './components/ConvocatoriaList';



const App = () => {
    return (
        <Router>
            <div>
                <NavBar />
                <Routes>
                    <Route path="/" element={<h1>Bienvenido al Sistema de Gestión de Convocatorias</h1>} />
                    <Route path="/facultades" element={<FacultadList />} />
                    <Route path="/facultades/nueva" element={<FacultadForm />} />
                    <Route path="/carreras" element={<CarreraList />} />
                    <Route path="/carreras/nueva" element={<CarreraForm />} />
                    <Route path="/convocatorias" element={<ConvocatoriaList />} />
                    <Route path="/convocatorias/nueva" element={<ConvocatoriaForm />} />
                </Routes>
            </div>
        </Router>
    );
  }
  
  export default App;
