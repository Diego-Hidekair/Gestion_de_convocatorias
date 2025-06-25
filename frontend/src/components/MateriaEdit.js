// src/components/MateriaEdit.js
import React, { useState, useEffect } from 'react';
import api from '../config/axiosConfig';  
import { useNavigate, useParams } from 'react-router-dom';

const MateriaEdit = () => {
  const { id } = useParams();
  const [codigomateria, setCodigoMateria] = useState('');
  const [nombre, setNombre] = useState('');
  const [horasTeoria, setHorasTeoria] = useState('');
  const [horasPractica, setHorasPractica] = useState('');
  const [horasLaboratorio, setHorasLaboratorio] = useState('');
  const [id_carrera, setIdCarrera] = useState('');
  const [carreras, setCarreras] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMateria = async () => {
      try {
        const response = await api.get(`/materias/${id}`);  // Aquí usas api
        const materia = response.data;
        setCodigoMateria(materia.codigomateria);
        setNombre(materia.nombre);
        setHorasTeoria(materia.horas_teoria);
        setHorasPractica(materia.horas_practica);
        setHorasLaboratorio(materia.horas_laboratorio);
        setIdCarrera(materia.id_carrera);
      } catch (error) {
        console.error('Error al obtener la materia:', error);
      }
    };

    const fetchCarreras = async () => {
      try {
        const response = await api.get('/carreras');  // Aquí usas api
        setCarreras(response.data);
      } catch (error) {
        console.error('Error al obtener las carreras:', error);
      }
    };

    fetchMateria();
    fetchCarreras();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/materias/${id}`, {  // Aquí usas api
        codigomateria,
        nombre,
        horas_teoria: horasTeoria,
        horas_practica: horasPractica,
        horas_laboratorio: horasLaboratorio,
        id_carrera
      });
      navigate('/materias');
    } catch (error) {
      console.error('Error al actualizar la materia:', error);
    }
  };

  return (
    <div className="container-materia">
      <h2>Editar Materia</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Código de Materia:</label>
          <input
            type="text"
            value={codigomateria}
            onChange={(e) => setCodigoMateria(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Nombre:</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Horas Teoría:</label>
          <input
            type="number"
            value={horasTeoria}
            onChange={(e) => setHorasTeoria(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Horas Práctica:</label>
          <input
            type="number"
            value={horasPractica}
            onChange={(e) => setHorasPractica(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Horas Laboratorio:</label>
          <input
            type="number"
            value={horasLaboratorio}
            onChange={(e) => setHorasLaboratorio(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Carrera:</label>
          <select
            value={id_carrera}
            onChange={(e) => setIdCarrera(e.target.value)}
            required
          >
            <option value="">Seleccione una carrera</option>
            {carreras.map((carrera) => (
              <option key={carrera.id_carrera} value={carrera.id_carrera}>
                {carrera.nombre_carrera}
              </option>
            ))}
          </select>
        </div>
        <button type="submit">Actualizar Materia</button>
      </form>
    </div>
  );
};

export default MateriaEdit;
