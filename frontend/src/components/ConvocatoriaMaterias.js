// src/components/ConvocatoriaMaterias.js
// src/components/ConvocatoriaMaterias.js
import React, { useState } from 'react';
import ConvocatoriaMateriasList from './ConvocatoriaMateriasList';
import ConvocatoriaMateriasForm from './ConvocatoriaMateriasForm';

const ConvocatoriaMaterias = ({ idConvocatoria }) => {
    const [refreshKey, setRefreshKey] = useState(0); // Key para forzar la actualización de componentes hijos

    const refreshMaterias = () => {
        setRefreshKey(prevKey => prevKey + 1);
    };

    return (
        <div className='container'>
            <ConvocatoriaMateriasList key={refreshKey} idConvocatoria={idConvocatoria} />
            <ConvocatoriaMateriasForm idConvocatoria={idConvocatoria} refreshMaterias={refreshMaterias} />
        </div>
    );
};

export default ConvocatoriaMaterias;