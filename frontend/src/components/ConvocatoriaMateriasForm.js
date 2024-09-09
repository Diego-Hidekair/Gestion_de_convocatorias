// frontend/src/components/ConvocatoriaMateriasForm.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CrearConvocatoriaMateria = () => {
  const [convocatorias, setConvocatorias] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [materiasSeleccionadas, setMateriasSeleccionadas] = useState([]);
  const [idConvocatoria, setIdConvocatoria] = useState('');
  const [materiaSeleccionada, setMateriaSeleccionada] = useState('');
  const [perfilProfesional, setPerfilProfesional] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConvocatorias = async () => {
      try {
        const response = await axios.get('http://localhost:5000/convocatorias');
        setConvocatorias(response.data);
      } catch (err) {
        setError('Error al obtener las convocatorias');
        console.error(err);
      }
    };

    fetchConvocatorias();
  }, []);

  useEffect(() => {
    const fetchMaterias = async () => {
      try {
        const response = await axios.get('http://localhost:5000/materias');
        setMaterias(response.data);
      } catch (err) {
        setError('Error al obtener las materias');
        console.error(err);
      }
    };

    fetchMaterias();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!idConvocatoria || materiasSeleccionadas.length === 0 || !perfilProfesional) {
      setError('Por favor, complete todos los campos');
      return;
    }

    try {
      await Promise.all(materiasSeleccionadas.map(async (materia) => {
        await axios.post('http://localhost:5000/convocatoria_materias', {
          id_convocatoria: idConvocatoria,
          id_materia: materia.id,
          perfil_profesional: perfilProfesional,
        });
      }));

      alert('ConvocatoriaMateria creada exitosamente');
    } catch (err) {
      setError('Error al crear la ConvocatoriaMateria');
      console.error(err);
    }
  };

  const handleAddMateria = () => {
    const materia = materias.find(m => m.id_materia === parseInt(materiaSeleccionada));
    if (materia && !materiasSeleccionadas.some(m => m.id === materia.id_materia)) {
      setMateriasSeleccionadas([...materiasSeleccionadas, materia]);
      setMateriaSeleccionada('');
    }
  };

  const handleRemoveMateria = (id) => {
    setMateriasSeleccionadas(materiasSeleccionadas.filter(materia => materia.id_materia !== id));
  };

  return (
    <div className="container mt-4">
      <h2>Crear una nueva ConvocatoriaMateria</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Seleccionar Convocatoria:</label>
          <select
            className="form-control"
            value={idConvocatoria}
            onChange={(e) => setIdConvocatoria(e.target.value)}
          >
            <option value="">Seleccione una convocatoria</option>
            {convocatorias.map((convocatoria) => (
              <option key={convocatoria.id_convocatoria} value={convocatoria.id_convocatoria}>
                {convocatoria.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Seleccionar Materia:</label>
          <select
            className="form-control"
            value={materiaSeleccionada}
            onChange={(e) => setMateriaSeleccionada(e.target.value)}
          >
            <option value="">Seleccione una materia</option>
            {materias.map((materia) => (
              <option key={materia.id_materia} value={materia.id_materia}>
                {materia.nombre}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn btn-secondary mt-2"
            onClick={handleAddMateria}
          >
            Agregar Materia
          </button>
        </div>

        <div className="mb-3">
          <h3>Materias Seleccionadas:</h3>
          <ul className="list-group">
            {materiasSeleccionadas.map((materia) => (
              <li key={materia.id_materia} className="list-group-item d-flex justify-content-between align-items-center">
                {materia.nombre} - {materia.horas_teoria + materia.horas_practica + materia.horas_laboratorio} Horas
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => handleRemoveMateria(materia.id_materia)}
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-3">
          <label className="form-label">Perfil Profesional:</label>
          <input
            type="text"
            className="form-control"
            value={perfilProfesional}
            onChange={(e) => setPerfilProfesional(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-primary">
          Siguiente
        </button>
      </form>
    </div>
  );
};


export default CrearConvocatoriaMateria;
