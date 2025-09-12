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
  const [maxHorasGlobal, setMaxHorasGlobal] = useState(0); // Nuevo estado para horas máximas

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

        // Establecer máximo de horas según el tipo de jornada
        const tipoJornada = convResponse.data.tipo_jornada;
        if (tipoJornada === 'TIEMPO HORARIO') {
          setMaxHorasGlobal(16);
        } else if (tipoJornada === 'TIEMPO COMPLETO') {
          setMaxHorasGlobal(); // O el valor que corresponda
        }

        // Cargar materias ya asignadas a la convocatoria
        try {
          const materiasAsignadasResponse = await api.get(
            `/convocatoria-materias/${id_convocatoria}`
          );
          
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

    // Validar solo una materia para docentes ordinarios
    if (soloUnaMateria && items.reduce((total, it) => total + it.materias.length, 0) >= 1) {
      setError('Solo se permite una materia para convocatorias de tipo Docente Ordinario');
      return;
    }

    const materia = materias.find(m => m.id_materia === parseInt(materiaSeleccionada));
    if (!materia) return;

    // Validar que la materia no esté ya agregada en ningún ítem
    const materiaYaAgregada = items.some(it => 
      it.materias.some(m => m.id_materia === materia.id_materia)
    );
    
    if (materiaYaAgregada) {
      setError('Esta materia ya ha sido agregada en otro ítem');
      return;
    }

    // Calcular horas totales si se agrega esta materia
    const nuevasHorasMateria = (materia.horas_teoria || 0) + (materia.horas_practica || 0) + (materia.horas_laboratorio || 0);
    const horasGlobalesActuales = calcularHorasGlobales();
    const horasGlobalesFuturas = horasGlobalesActuales + nuevasHorasMateria;

    // Validar máximo de horas globales
    if (maxHorasGlobal > 0 && horasGlobalesFuturas > maxHorasGlobal) {
      setError(`No se puede superar el máximo de ${maxHorasGlobal} horas globales. Horas actuales: ${horasGlobalesActuales}, horas de la materia: ${nuevasHorasMateria}`);
      return;
    }

    // Agregar la materia
    setItems(prev =>
      prev.map((it, idx) =>
        idx === itemIndex
          ? {
            ...it,
            materias: [
              ...it.materias,
              {
                ...materia,
                total_horas: nuevasHorasMateria
              }
            ]
          }
          : it
      )
    );
    setMateriaSeleccionada('');
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
    // Validar que no se puedan agregar más ítems si es solo una materia
    if (soloUnaMateria) {
      setError('Solo se permite un ítem con una materia para convocatorias de tipo Docente Ordinario');
      return;
    }
    
    const nuevoItem = Math.max(...items.map(it => it.item), 0) + 1;
    setItems([...items, { item: nuevoItem, materias: [] }]);
  };

  const handleRemoveItem = (index) => {
    if (items.length <= 1) {
      setError('Debe haber al menos un ítem');
      return;
    }
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

    // Validación final de horas globales
    const horasGlobales = calcularHorasGlobales();
    if (maxHorasGlobal > 0 && horasGlobales > maxHorasGlobal) {
      setError(`No se puede superar el máximo de ${maxHorasGlobal} horas globales. Horas actuales: ${horasGlobales}`);
      return;
    }

    try {
      setLoading(true);
      
      const datosParaEnviar = {
        items: items.map(it => ({
          item: it.item,
          materias: it.materias.map(m => ({
            id_materia: m.id_materia
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

        {soloUnaMateria && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Convocatoria de tipo Docente Ordinario: Solo se permite UNA materia
          </Alert>
        )}

        {maxHorasGlobal > 0 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Límite máximo: {maxHorasGlobal} horas
          </Alert>
        )}

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
                     El ítem {it.item} tiene {totalHorasItem} horas, y no debe superar 16 horas para TIEMPO HORARIO.
                  </Alert>
                );
              } else if (tipo === 'TIEMPO COMPLETO' && totalHorasItem < 20) {
                alerta = (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    El ítem {it.item} tiene {totalHorasItem} horas, pero debe tener al menos 20 horas para TIEMPO COMPLETO.
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
                        disabled={soloUnaMateria && items.reduce((total, it) => total + it.materias.length, 0) >= 1}
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
                      disabled={!materiaSeleccionada || (soloUnaMateria && items.reduce((total, it) => total + it.materias.length, 0) >= 1)}
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

        {!soloUnaMateria && (
          <Button variant="outlined" onClick={handleAddItem} sx={{ mb: 3 }}>
            ➕ Agregar Ítem
          </Button>
        )}

        <Divider sx={{ my: 2 }} />

        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button variant="outlined" onClick={handleVolver}>
            Volver a Editar Convocatoria
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || (maxHorasGlobal > 0 && calcularHorasGlobales() > maxHorasGlobal)}
          >
            {loading ? 'Guardando...' : 'Guardar Materias'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ConvocatoriaMateriasForm;