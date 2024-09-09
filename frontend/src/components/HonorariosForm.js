import React, { useState, useEffect } from 'react';
import axios from 'axios';

const HonorariosForm = () => {
  const [honorario, setHonorario] = useState('');
  const [tiposHonorarios, setTiposHonorarios] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTiposHonorarios = async () => {
      try {
        const response = await axios.get('http://localhost:5000/tipos-honorarios'); // Modifica según tu API
        setTiposHonorarios(response.data);
      } catch (err) {
        setError('Error al obtener los tipos de honorarios');
        console.error(err);
      }
    };

    fetchTiposHonorarios();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!honorario) {
      setError('Por favor, seleccione un tipo de honorario');
      return;
    }

    try {
      await axios.post('http://localhost:5000/honorarios', { honorario });
      alert('Honorario creado exitosamente');
    } catch (err) {
      setError('Error al crear el honorario');
      console.error(err);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Crear Honorario</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Seleccionar Tipo de Honorario:</label>
          <select
            className="form-control"
            value={honorario}
            onChange={(e) => setHonorario(e.target.value)}
          >
            <option value="">Seleccione un tipo de honorario</option>
            {tiposHonorarios.map((tipo) => (
              <option key={tipo.id_honorario} value={tipo.id_honorario}>
                {tipo.nombre}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="btn btn-primary">
          Guardar Honorario
        </button>
      </form>
    </div>
  );
};

export default HonorariosForm;
