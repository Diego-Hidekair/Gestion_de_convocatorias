import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NavBar from './components/NavBar';
import FacultadForm from './components/FacultadForm';
import FacultadList from './components/FacultadList';
import FacultadEdit from './components/FacultadEdit';
import CarreraForm from './components/CarreraForm';
import CarreraList from './components/CarreraList';
import CarreraEdit from './components/CarreraEdit';
import ConvocatoriaForm from './components/ConvocatoriaForm';
import ConvocatoriaList from './components/ConvocatoriaList';
import ConvocatoriaEdit from './components/ConvocatoriaEdit';



const App = () => {
    return (
        <Router>
            <div>
                <NavBar />
                <Routes>
                    <Route path="/" element={<h1>Bienvenido al Sistema de Gestión de Convocatorias</h1>} />
                    <Route path="/facultades" element={<FacultadList />} />
                    <Route path="/facultades/nueva" element={<FacultadForm />} />
                    <Route path="/facultades/editar/:id" element={<FacultadEdit />} />
                    <Route path="/carreras" element={<CarreraList />} />
                    <Route path="/carreras/nueva" element={<CarreraForm />} />
                    <Route path="/carreras/editar/:id" element={<CarreraEdit />} />
                    <Route path="/convocatorias" element={<ConvocatoriaList />} />
                    <Route path="/convocatorias/nueva" element={<ConvocatoriaForm />} />
                    <Route path="/convocatorias/editar/:id" element={<ConvocatoriaEdit />} />
                </Routes>
            </div>
        </Router>
    );
}
  
  export default App;
