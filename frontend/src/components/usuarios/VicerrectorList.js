// src/components/usuarios/VicerrectorList.js
import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Grid } from '@mui/material';
import api from '../../config/axiosConfig';

const VicerrectorList = () => {
  const [vicerrectores, setVicerrectores] = useState([]);

  useEffect(() => {
    const fetchVicerrectores = async () => {
      try {
        const res = await api.get('/docentes-vicerrectores/vicerrectores');
        setVicerrectores(res.data);
      } catch (error) {
        console.error('Error al obtener vicerrectores:', error);
      }
    };
    fetchVicerrectores();
  }, []);

  return (
    <Grid container spacing={2}>
      {vicerrectores.map((v) => (
        <Grid item xs={12} md={6} key={v.id_vicerector}>
          <Card>
            <CardContent>
              <Typography variant="h6">{v.nombre_vicerector}</Typography>
              <Typography variant="body2" color="text.secondary">
                Docente: {v.nombres} {v.apellidos}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default VicerrectorList;
