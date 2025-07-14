import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Container, Typography, Button, TextField, Select, MenuItem, 
  FormControl, InputLabel, List, ListItem, ListItemText, 
  IconButton, Paper, Box, Alert, Divider, CircularProgress 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../../../config/axiosConfig';

const ConvocatoriaMateriasEdit = () => {
    const { id_convocatoria } = useParams();
    const navigate = useNavigate();
    const [materias, setMaterias] = useState([]);
    const [materiasSeleccionadas, setMateriasSeleccionadas] = useState([]);
    const [materiaSeleccionada, setMateriaSeleccionada] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [convocatoriaData, setConvocatoriaData] = useState(null);
    const [soloUnaMateria, setSoloUnaMateria] = useState(false);
    const [horasAsignadasGlobal, setHorasAsignadasGlobal] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Obtener datos de la convocatoria
                const convResponse = await api.get(`/convocatorias/${id_convocatoria}`);
                setConvocatoriaData(convResponse.data);
                const tipoConv = convResponse.data.nombre_tipo_conv?.trim().toUpperCase();
                    if (tipoConv === 'DOCENTE EN CALIDAD ORDINARIO') {
                    setSoloUnaMateria(true);
                    }
                
                // Obtener todas las materias del programa
                const materiasResponse = await api.get(
                    `/convocatoria-materias/programa/${convResponse.data.id_programa}/materias`
                );
                setMaterias(materiasResponse.data);
                
                // Obtener materias ya asignadas a la convocatoria
                const asignadasResponse = await api.get(
                    `/convocatoria-materias/${id_convocatoria}/materias`
                );
                setMateriasSeleccionadas(asignadasResponse.data);
                
                setLoading(false);
            } catch (err) {
                setError('Error al cargar los datos');
                console.error(err);
                setLoading(false);
            }
        };

        fetchData();
    }, [id_convocatoria]);

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

    const operaciones = materiasSeleccionadas.map(materia => ({
      tipo: 'agregar', // o 'actualizar' si prefieres sobreescribir
      id_materia: materia.id_materia,
      total_horas: materia.total_horas,
      horas_asignadas: horasAsignadasGlobal
    }));
            
            // Enviar al endpoint de actualización masiva
            await api.put(`/convocatoria-materias/${id_convocatoria}/materias`, { operaciones });
            
            // Redirigir a la generación de PDF
            navigate(`/convocatorias/${id_convocatoria}/archivos`);
  } catch (err) {
    console.error('Error en handleSubmit:', err);
    if (err.response?.status === 200 || err.response?.data?.success) {
      navigate(`/convocatorias/${id_convocatoria}/archivos`);
    } else {
      setError(err.response?.data?.error || 'Error al actualizar las materias');
    }
  } finally {
    setLoading(false);
  }
};

    const handleVolver = () => {
        navigate(`/convocatorias/editar/${id_convocatoria}`);
    };

    if (loading && !convocatoriaData) {
        return (
            <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Container>
        );
    }

    if (!convocatoriaData) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Alert severity="error">
                    {error || 'No se pudo cargar la información de la convocatoria'}
                </Alert>
                <Button onClick={() => navigate(-1)} sx={{ mt: 2 }}>
                    Volver
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="md">
            <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
                <Typography variant="h5" gutterBottom>
                    Editar Materias de la Convocatoria
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {convocatoriaData && (
                    <Box sx={{ mb: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                        <Typography variant="subtitle1" gutterBottom>
                            <strong>Convocatoria:</strong> {convocatoriaData.nombre_conv}
                        </Typography>
                        <Typography variant="body2">
                            <strong>Programa:</strong> {convocatoriaData.programa || convocatoriaData.nombre_programa}
                        </Typography>
                        <Typography variant="body2">
                            <strong>Tipo:</strong> {convocatoriaData.nombre_tipoconvocatoria || convocatoriaData.nombre_tipo_conv}
                        </Typography>
                    </Box>
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
                                        <TextField
                                            type="number"
                                            size="small"
                                            value={materia.total_horas}
                                            onChange={(e) => {
                                                const newValue = parseInt(e.target.value) || 0;
                                                if (newValue > 0) {
                                                    setMateriasSeleccionadas(prev =>
                                                        prev.map(m =>
                                                            m.id_materia === materia.id_materia
                                                                ? { ...m, total_horas: newValue }
                                                                : m
                                                        )
                                                    );
                                                }
                                            }}
                                            sx={{ width: '100px', mr: 2 }}
                                            inputProps={{
                                                min: 1,
                                                title: "Horas totales (puede modificar este valor)"
                                            }}
                                            helperText="Horas totales"
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
                        {soloUnaMateria && (
  <Alert severity="info" sx={{ mb: 2 }}>
    Esta convocatoria permite seleccionar <strong>solo una materia</strong> (Docente Ordinario).
  </Alert>
)}
                    </List>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                    <Button
                        variant="outlined"
                        onClick={handleVolver}
                    >
                        Volver a Editar Convocatoria
                    </Button>
                    {materiasSeleccionadas.length > 0 && (
  <Box sx={{ mt: 3 }}>
    <Typography variant="subtitle1" gutterBottom>
      Ingrese el número de <strong>horas asignadas</strong> para esta convocatoria:
    </Typography>
    <TextField
      label="Horas asignadas"
      type="number"
      fullWidth
      value={horasAsignadasGlobal}
      onChange={(e) => setHorasAsignadasGlobal(e.target.value)}
      inputProps={{ min: 0 }}
      helperText="Ingrese el valor de horas designadas para un Item de convocatoria"
    />
  </Box>
)}
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? 'Guardando...' : 'Guardar Cambios y Generar PDF'}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default ConvocatoriaMateriasEdit;