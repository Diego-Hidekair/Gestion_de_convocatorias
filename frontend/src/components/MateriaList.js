// src/components/MateriaList.js
import React, { useState, useEffect } from 'react';
import api from '../config/axiosConfig'; 
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Alert, useTheme } from '@mui/material';

const MateriaList = ({ isOpen }) => {
  const [materias, setMaterias] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [materiasResponse, carrerasResponse] = await Promise.all([
          api.get('/materias'),  
          api.get('/carreras')
        ]);

        const materiasWithCarreras = materiasResponse.data.map((materia) => {
          const carrera = carrerasResponse.data.find(
            (c) => c.id_programa === materia.id_programa
          );
          return {
            ...materia,
            nombre_carrera: carrera ? carrera.nombre_carrera : 'Desconocido'
          };
        });

        setMaterias(materiasWithCarreras);
        setCarreras(carrerasResponse.data);
        setLoading(false);
      } catch (err) {
        console.error('Error al obtener las materias y carreras:', err);
        setError('Error al cargar los datos. Por favor intente nuevamente.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box m={2}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        ml: isOpen ? '240px' : '0px',
        transition: theme.transitions.create('margin', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        p: 3,
        width: isOpen ? 'calc(100% - 240px)' : '100%'
      }}
    >
      <Paper elevation={3} sx={{ p: 2 }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
          Lista de Materias
        </Typography>

        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="Tabla de materias">
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Código</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nombre</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Horas Teoría</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Horas Práctica</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Horas Laboratorio</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Total Horas</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Carrera</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {materias.map((materia) => (
                <TableRow
                  key={materia.codigomateria}
                  sx={{ '&:nth-of-type(odd)': { backgroundColor: theme.palette.action.hover } }}
                >
                  <TableCell>{materia.codigomateria}</TableCell>
                  <TableCell>{materia.nombre}</TableCell>
                  <TableCell align="right">{materia.horas_teoria}</TableCell>
                  <TableCell align="right">{materia.horas_practica}</TableCell>
                  <TableCell align="right">{materia.horas_laboratorio}</TableCell>
                  <TableCell align="right">{materia.total_horas}</TableCell>
                  <TableCell>{materia.nombre_carrera}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default MateriaList;
