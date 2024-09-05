// frontend/src/components/ConvocatoriaEstado.js
    import React, { useEffect, useState } from 'react';
    import axios from 'axios';

const ConvocatoriaEstado = ({ userRol }) => {
    const [convocatorias, setConvocatorias] = useState([]);

    useEffect(() => {
        const fetchConvocatorias = async () => {
            try {
                const response = await axios.get('http://localhost:5000/convocatorias/convocatorias-estado');
                //console.log(response.data); // Verifica la respuesta
                setConvocatorias(response.data);
            } catch (error) {
                console.error('Error al obtener las convocatorias:', error);
            }
        };

        fetchConvocatorias();
    }, []);

    const handleEstadoChange = async (id_convocatoria, nuevoEstado) => {
        ///autorizacion solo para el admin
        if (userRol !== 'admin') {
            alert('No tienes permiso para cambiar el estado');
            return;
        }

        try {
            await axios.put(`http://localhost:5000/convocatorias/${id_convocatoria}/estado`, { estado: nuevoEstado });
            setConvocatorias((prevConvocatorias) =>
                prevConvocatorias.map((convocatoria) =>
                    convocatoria.id_convocatoria === id_convocatoria
                        ? { ...convocatoria, estado: nuevoEstado }
                        : convocatoria
                )
            );
        } catch (error) {
            console.error('Error al actualizar el estado:', error);
        }
    };

    return (
        <div>
            <h2>Estado de las Convocatorias</h2>
            <ul>
            {/*console.log(convocatorias)*/}
                {convocatorias.length > 0 ? (
                    convocatorias.map((convocatoria, index) => (
                        <li key={convocatoria.id_convocatoria}>
                            <p>N° de convocatoria: {index + 1}</p>
                            <p>Nombre: {convocatoria.nombre}</p>
                            <p>Fecha de Creación: {convocatoria.fecha_inicio}</p>
                            <p>Archivo PDF: <a href={`http://localhost:5000/pdfs/${convocatoria.id_convocatoria}`}>Descargar</a></p>
                            <button
                            style={{
                                backgroundColor: convocatoria.estado === 'Revisado' ? '#00651c' :
                                    convocatoria.estado === 'En Revisión' ? '#ff8733' :
                                        convocatoria.estado === 'para revision' ? '#144586' :
                                            convocatoria.estado === 'Observado' ? '#c0392b' :
                                                '#144586',
                                color: 'white'
                            }}
                                onClick={() =>
                                    handleEstadoChange(
                                        convocatoria.id_convocatoria,
                                        convocatoria.estado === 'Revisado' ? 'Para Revisión' :
                                            convocatoria.estado === 'En Revisión' ? 'Observado' :
                                                'Revisado'
                                    )
                                }
                            >
                                    {convocatoria.estado}
                            </button>
                        </li>
                    ))
                ) : (
                    <p>No hay convocatorias disponibles.</p>
                )}
            </ul>
        </div>
    );
};

export default ConvocatoriaEstado;