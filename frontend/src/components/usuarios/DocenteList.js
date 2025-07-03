// src/components/usuarios/DocenteList.js
import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Grid } from '@mui/material';
import api from '../../config/axiosConfig';

const DocenteList = () => {
  const [docentes, setDocentes] = useState([]);

  useEffect(() => {
    const fetchDocentes = async () => {
      try {
        const res = await api.get('/docentes-vicerrectores/docentes');
        setDocentes(res.data);
      } catch (error) {
        console.error('Error al obtener docentes:', error);
      }
    };
    fetchDocentes();
  }, []);

  return (
    <Grid container spacing={2}>
      {docentes.map((docente) => (
        <Grid item xs={12} md={6} key={docente.id_docente}>
          <Card>
            <CardContent>
              <Typography variant="h6">
                {docente.nombres} {docente.apellidos}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Facultad: {docente.nombre_facultad}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default DocenteList;
