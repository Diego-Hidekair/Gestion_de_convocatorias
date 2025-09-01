// frontend/src/components/convocatorias/ConvocatoriaMaterias/ConvocatoriaMateriasForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Typography, Button, TextField, Select, MenuItem, FormControl, InputLabel, List, ListItem, ListItemText, IconButton, Paper, Box, Alert, Divider } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../../../config/axiosConfig';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const ConvocatoriaMateriasForm = () => {
    const { id_convocatoria } = useParams();
    const navigate = useNavigate();
    const [materias, setMaterias] = useState([]);
    const [materiasSeleccionadas, setMateriasSeleccionadas] = useState([]);
    const [materiaSeleccionada, setMateriaSeleccionada] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [convocatoriaData, setConvocatoriaData] = useState(null);
    const [horasTotalesGlobal, setHorasTotalesGlobal] = useState(0);
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

            try {
                const materiasResponse = await api.get(
                    `/convocatoria-materias/programa/${convResponse.data.id_programa}/materias`
                );
                setMaterias(materiasResponse.data);
            } catch (materiasError) {
                if (materiasError.response?.status === 404) {
                    setMaterias([]);
                    console.log('No se encontraron materias para este programa');
                } else {
                    throw materiasError;
                }
            }

           const asignadasResponse = await api.get(
                    `/convocatoria-materias/${id_convocatoria}/materias`
                );
                setMateriasSeleccionadas(asignadasResponse.data);
                
            } catch (err) {
                console.error('Error completo:', err);
                setError('Error al cargar los datos: ' + (err.response?.data?.error || err.message));
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id_convocatoria]);
    useEffect(() => {
        const total = materiasSeleccionadas.reduce(
            (sum, m) => sum + (m.total_horas || 0), 
            0
        );
        setHorasTotalesGlobal(total);
    }, [materiasSeleccionadas]);

    const handleAddMateria = () => {
  setError(null);

  if (!materiaSeleccionada) return;

  if (soloUnaMateria && materiasSeleccionadas.length >= 1) {
    setError('Solo se permite una materia para convocatorias de tipo Docente Ordinario');
    return;
  }

  const materia = materias.find(m => m.id_materia === materiaSeleccionada);
  if (materia && !materiasSeleccionadas.some(m => m.id_materia === materia.id_materia)) {
    setMateriasSeleccionadas(prev => [
      ...prev,
      {
        ...materia,
        total_horas: materia.horas_teoria + materia.horas_practica + materia.horas_laboratorio,
        horas_asignadas: ''
      }
    ]);
    setMateriaSeleccionada('');
  }
};

    const handleRemoveMateria = (id) => {
        setMateriasSeleccionadas(prev => prev.filter(m => m.id_materia !== id));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (materiasSeleccionadas.length === 0) {
            setError('Debe seleccionar al menos una materia');
            return;
        }
        try {
            setLoading(true);
            await api.post(`/convocatoria-materias/${id_convocatoria}/materias`, {
            materias: materiasSeleccionadas.map(m => ({
                id_materia: m.id_materia,
                horas_asignadas: m.total_horas 
            }))
            });
            navigate(`/convocatorias/${id_convocatoria}/archivos`);
        } catch (err) {
            console.error('Error en handleSubmit:', err);
            if (err.response?.status === 200 || err.response?.data?.success) {
            navigate(`/convocatorias/${id_convocatoria}/archivos`);
            } else {
            setError(err.response?.data?.error || 'Error al guardar las materias');
            }
        } finally {
            setLoading(false);
        }
        };

            const handleVolver = () => {
            console.log("Navegando a edición con ID:", id_convocatoria); 
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
    {(() => {
      const tipo = convocatoriaData.tipo_jornada;
      const totalHoras = materiasSeleccionadas.reduce((sum, m) => sum + (m.total_horas || 0), 0);

      if (tipo === 'TIEMPO HORARIO' && totalHoras > 16) {
        return (
          <Alert severity="warning" sx={{ mt: 2 }}>
            ⚠️ La suma total de horas es <strong>{totalHoras}</strong>, y no debe superar 16 horas para una convocatoria de <strong>TIEMPO HORARIO</strong>.
          </Alert>
        );
      }

      if (tipo === 'TIEMPO COMPLETO' && totalHoras < 20) {
        return (
          <Alert severity="warning" sx={{ mt: 2 }}>
            ⚠️ La suma total de horas es <strong>{totalHoras}</strong>, pero debe ser al menos 20 horas para una convocatoria de <strong>TIEMPO COMPLETO</strong>.
          </Alert>
        );
      }

      return null;
    })()}

    <Box sx={{ mb: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
      <Typography variant="subtitle1" gutterBottom>
        <strong>Convocatoria:</strong> {convocatoriaData.nombre_conv}
      </Typography>
      <Typography variant="body2">
        <strong>Tipo:</strong> {convocatoriaData.nombre_tipoconvocatoria || convocatoriaData.nombre_tipo_conv}
      </Typography>
      {soloUnaMateria && (
  <Alert severity="info" sx={{ mb: 2 }}>
    Esta convocatoria permite seleccionar <strong>solo una materia</strong> (Docente Ordinario).
  </Alert>
)}
    </Box>
  </>
)}
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
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
                                    disabled={materiasSeleccionadas.some(m => m.id_materia === materia.id_materia)}
                                >
                                    {materia.materia} ({materia.cod_materia})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Button
                        variant="contained"
                        onClick={handleAddMateria}
                        disabled={!materiaSeleccionada}
                    >
                        Agregar
                    </Button>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" gutterBottom>
                    Materias Seleccionadas
                </Typography>

                {materiasSeleccionadas.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                        No hay materias seleccionadas
                    </Typography>
                ) : (
                    <List dense>
                        {materiasSeleccionadas.map(materia => (
                            <ListItem
                            key={materia.id_materia}
                            secondaryAction={
                                <>
                                {/* Ahora mostramos solo total_horas en un campo pequeño */}
                                <TextField
                                    type="number"
                                    size="small"
                                    value={materia.total_horas}
                                    InputProps={{ readOnly: true }}
                                    sx={{ width: '80px', mr: 2 }}
                                    inputProps={{
                                    title: "Total de horas de la materia",
                                    style: { textAlign: 'center' } // centrado
                                    }}
                                />
                                <IconButton
                                    edge="end"
                                    onClick={() => handleRemoveMateria(materia.id_materia)}
                                >
                                    <DeleteIcon color="error" />
                                </IconButton>
                                </>
                            }
                            >
                            <ListItemText
                                primary={`${materia.materia} (${materia.cod_materia})`}
                                secondary={`Teoría: ${materia.horas_teoria}h - Práctica: ${materia.horas_practica}h - Lab: ${materia.horas_laboratorio}h`}
                            />
                            </ListItem>
                        ))}
                        </List>
                )}
                    {materiasSeleccionadas.length > 0 && (
                        <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'flex-end', 
                            mt: 2
                        }}>
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
                                Horas totales:
                            </Typography>
                            <Chip 
                                label={horasTotalesGlobal} 
                                color="primary" 
                                variant="filled"
                                sx={{ fontWeight: 'bold', fontSize: '1rem' }}
                            />
                            <Tooltip title="Suma de horas de todas las materias seleccionadas">
                                <InfoOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                            </Tooltip>
                            </Box>
                        </Box>
                        )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                    <Button
                        variant="outlined"
                        onClick={handleVolver}
                    >
                        Volver a Editar Convocatoria
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={materiasSeleccionadas.length === 0 || loading}
                    >
                        {loading ? 'Guardando...' : 'Guardar Materias'}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default ConvocatoriaMateriasForm;