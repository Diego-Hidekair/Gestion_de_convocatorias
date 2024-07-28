// frontend/src/components/ConvocatoriaMaterias.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ConvocatoriaMateriasList from './ConvocatoriaMateriasList';
import ConvocatoriaMateriasForm from './ConvocatoriaMateriasForm';

const ConvocatoriaMaterias = () => {
    return (
        <Routes>
            <Route path="/" element={<ConvocatoriaMateriasList />} />
            <Route path="/new" element={<ConvocatoriaMateriasForm />} />
        </Routes>
    );
};

export default ConvocatoriaMaterias;
