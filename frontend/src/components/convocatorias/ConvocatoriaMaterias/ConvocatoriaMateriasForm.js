// frontend/src/components/convocatorias/ConvocatoriaMaterias/ConvocatoriaMateriasForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Typography, Button, TextField, Select, MenuItem, FormControl, InputLabel, List, ListItem, ListItemText, IconButton, Paper, Box, Alert, Divider, Chip, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import api from '../../../config/axiosConfig';

const ConvocatoriaMateriasForm = () => {
  const { id_convocatoria } = useParams();
  const navigate = useNavigate();

  const [materias, setMaterias] = useState([]);
  const [items, setItems] = useState([{ item: 1, materias: [] }]);
  const [materiaSeleccionada, setMateriaSeleccionada] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [convocatoriaData, setConvocatoriaData] = useState(null);
  const [soloUnaMateria, setSoloUnaMateria] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const convResponse = await api.get(`/convocatorias/${id_convocatoria}`);
        setConvocatoriaData(convResponse.data);

        const tipoConv = convResponse.data.nombre_tipoconvocatoria?.trim().toUpperCase();
        if (tipoConv === 'DOCENTE EN CALIDAD ORDINARIO') {
          setSoloUnaMateria(true);
        }

        // Cargar materias ya asignadas a la convocatoria
        try {
          const materiasAsignadasResponse = await api.get(
            `/convocatoria-materias/${id_convocatoria}`
          );
          
          // Si hay materias asignadas, organizarlas por ítem
          if (materiasAsignadasResponse.data && Object.keys(materiasAsignadasResponse.data).length > 0) {
            const nuevosItems = [];
            Object.keys(materiasAsignadasResponse.data).forEach(itemKey => {
              nuevosItems.push({
                item: parseInt(itemKey),
                materias: materiasAsignadasResponse.data[itemKey]
              });
            });
            setItems(nuevosItems);
          }
        } catch (error) {
          console.log('No hay materias asignadas aún');
        }

        // Cargar materias disponibles del programa
        try {
          const materiasResponse = await api.get(
            `/convocatoria-materias/programa/${convResponse.data.id_programa}/materias`
          );
          setMaterias(materiasResponse.data);
        } catch (materiasError) {
          if (materiasError.response?.status === 404) {
            setMaterias([]);
          } else {
            throw materiasError;
          }
        }
      } catch (err) {
        console.error('Error completo:', err);
        setError('Error al cargar los datos: ' + (err.response?.data?.error || err.message));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id_convocatoria]);

  const calcularHorasTotales = (materias) =>
    materias.reduce((sum, m) => sum + (m.total_horas || 0), 0);

  const calcularHorasGlobales = () =>
    items.reduce((acc, it) => acc + calcularHorasTotales(it.materias), 0);

  const handleAddMateria = (itemIndex) => {
    setError(null);

    if (!materiaSeleccionada) return;

    if (soloUnaMateria && items.reduce((total, it) => total + it.materias.length, 0) >= 1) {
      setError('Solo se permite una materia para convocatorias de tipo Docente Ordinario');
      return;
    }

    const materia = materias.find(m => m.id_materia === parseInt(materiaSeleccionada));
    if (materia && !items[itemIndex].materias.some(m => m.id_materia === materia.id_materia)) {
      setItems(prev =>
        prev.map((it, idx) =>
          idx === itemIndex
            ? {
              ...it,
              materias: [
                ...it.materias,
                {
                  ...materia,
                  total_horas: (materia.horas_teoria || 0) + (materia.horas_practica || 0) + (materia.horas_laboratorio || 0)
                }
              ]
            }
            : it
        )
      );
      setMateriaSeleccionada('');
    }
  };

  const handleRemoveMateria = (itemIndex, id) => {
    setItems(prev =>
      prev.map((it, idx) =>
        idx === itemIndex
          ? { ...it, materias: it.materias.filter(m => m.id_materia !== id) }
          : it
      )
    );
  };

  const handleAddItem = () => {
    const nuevoItem = Math.max(...items.map(it => it.item), 0) + 1;
    setItems([...items, { item: nuevoItem, materias: [] }]);
  };

  const handleRemoveItem = (index) => {
    setItems(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const todasMaterias = items.flatMap(it => it.materias);

    if (todasMaterias.length === 0) {
      setError('Debe seleccionar al menos una materia');
      return;
    }

    try {
      setLoading(true);
      
      // Preparar datos para enviar al backend
      const datosParaEnviar = {
        items: items.map(it => ({
          item: it.item,
          materias: it.materias.map(m => ({
            id_materia: m.id_materia
            // total_horas se calculará en el backend
          }))
        }))
      };

      await api.post(`/convocatoria-materias/${id_convocatoria}/materias`, datosParaEnviar);
      navigate(`/convocatorias/${id_convocatoria}/archivos`);
    } catch (err) {
      console.error('Error en handleSubmit:', err);
      setError(err.response?.data?.error || 'Error al guardar las materias');
    } finally {
      setLoading(false);
    }
  };

  const handleVolver = () => {
    navigate(`/convocatorias/edit/${id_convocatoria}`, {
      state: { fromMaterias: true },
      replace: true
    });
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Asignar Materias a la Convocatoria
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {convocatoriaData && (
          <>
            {items.map((it, itemIndex) => {
              const totalHorasItem = calcularHorasTotales(it.materias);
              const tipo = convocatoriaData.tipo_jornada;
              
              let alerta = null;
              if (tipo === 'TIEMPO HORARIO' && totalHorasItem > 16) {
                alerta = (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    ⚠️ El ítem {it.item} tiene {totalHorasItem} horas, y no debe superar 16 horas para TIEMPO HORARIO.
                  </Alert>
                );
              } else if (tipo === 'TIEMPO COMPLETO' && totalHorasItem < 20) {
                alerta = (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    ⚠️ El ítem {it.item} tiene {totalHorasItem} horas, pero debe tener al menos 20 horas para TIEMPO COMPLETO.
                  </Alert>
                );
              }
              
              return (
                <Box key={itemIndex} sx={{ mb: 3, p: 2, border: '1px solid #ddd', borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">Ítem {it.item}</Typography>
                    {items.length > 1 && (
                      <Button color="error" onClick={() => handleRemoveItem(itemIndex)}>
                        Eliminar Ítem
                      </Button>
                    )}
                  </Box>

                  {alerta}

                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <FormControl fullWidth>
                      <InputLabel>Seleccionar Materia</InputLabel>
                      <Select
                        value={materiaSeleccionada}
                        onChange={(e) => setMateriaSeleccionada(e.target.value)}
                        label="Seleccionar Materia"
                      >
                        <MenuItem value=""><em>Seleccione una materia</em></MenuItem>
                        {materias.map(materia => (
                          <MenuItem
                            key={materia.id_materia}
                            value={materia.id_materia}
                            disabled={items.some(it => it.materias.some(m => m.id_materia === materia.id_materia))}
                          >
                            {materia.materia} ({materia.cod_materia}) - 
                            Teoría: {materia.horas_teoria}h, Práctica: {materia.horas_practica}h, Lab: {materia.horas_laboratorio}h
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Button
                      variant="contained"
                      onClick={() => handleAddMateria(itemIndex)}
                      disabled={!materiaSeleccionada}
                    >
                      Agregar
                    </Button>
                  </Box>

                  <List dense>
                    {it.materias.map(materia => (
                      <ListItem
                        key={materia.id_materia}
                        secondaryAction={
                          <IconButton edge="end" onClick={() => handleRemoveMateria(itemIndex, materia.id_materia)}>
                            <DeleteIcon color="error" />
                          </IconButton>
                        }
                      >
                        <ListItemText
                          primary={`${materia.materia} (${materia.cod_materia})`}
                          secondary={`Teoría: ${materia.horas_teoria}h - Práctica: ${materia.horas_practica}h - Lab: ${materia.horas_laboratorio}h - Total: ${materia.total_horas}h`}
                        />
                      </ListItem>
                    ))}
                  </List>

                  {it.materias.length > 0 && (
                    <Box sx={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      mt: 2
                    }}>
                      <Chip
                        label={`Horas totales ítem ${it.item}: ${totalHorasItem}`}
                        color="primary"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </Box>
                  )}
                </Box>
              );
            })}
          </>
        )}

        <Button variant="outlined" onClick={handleAddItem} sx={{ mb: 3 }}>
          ➕ Agregar Ítem
        </Button>

        <Divider sx={{ my: 2 }} />

        {items.some(it => it.materias.length > 0) && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              p: 1.5,
              border: '1px dashed',
              borderColor: 'primary.light',
              borderRadius: 2,
              backgroundColor: 'rgba(25, 118, 210, 0.04)'
            }}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                Horas totales globales:
              </Typography>
              <Chip
                label={calcularHorasGlobales()}
                color="primary"
                variant="filled"
                sx={{ fontWeight: 'bold', fontSize: '1rem' }}
              />
              <Tooltip title="Suma de horas de todas las materias en todos los ítems">
                <InfoOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              </Tooltip>
            </Box>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button variant="outlined" onClick={handleVolver}>
            Volver a Editar Convocatoria
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar Materias'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ConvocatoriaMateriasForm;