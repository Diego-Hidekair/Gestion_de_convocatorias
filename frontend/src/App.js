import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NavBar from './components/NavBar';
import FacultadForm from './components/FacultadForm';
import CarreraForm from './components/CarreraForm';
import ConvocatoriaForm from './components/ConvocatoriaForm';



const App = () => {
  return (
      <Router>
          <div>
              <NavBar />
              <Routes>
                  <Route path="/" element={<h1>Bienvenido al Sistema de Gestión de Convocatorias</h1>} />
                  <Route path="/facultades" element={<FacultadForm />} />
                  <Route path="/carreras" element={<CarreraForm />} />
                  <Route path="/convocatorias" element={<ConvocatoriaForm />} />
              </Routes>
          </div>
      </Router>
  );
}

export default App;
