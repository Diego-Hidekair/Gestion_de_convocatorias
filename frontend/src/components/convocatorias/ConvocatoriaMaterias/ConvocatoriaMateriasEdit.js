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

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Obtener datos de la convocatoria
                const convResponse = await api.get(`/convocatorias/${id_convocatoria}`);
                setConvocatoriaData(convResponse.data);
                
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
        if (!materiaSeleccionada) return;

        const materia = materias.find(m => m.id_materia === materiaSeleccionada);
        if (materia && !materiasSeleccionadas.some(m => m.id_materia === materia.id_materia)) {
            setMateriasSeleccionadas(prev => [
                ...prev,
                {
                    ...materia,
                    total_horas: materia.horas_teoria + materia.horas_practica + materia.horas_laboratorio
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
        // Usamos PUT en lugar de POST para la edición
        await api.put(
            `/convocatoria-materias/${id_convocatoria}/materias`,
            {
                materias: materiasSeleccionadas.map(m => ({
                    id_materia: m.id_materia,
                    total_horas: m.total_horas
                }))
            }
        );
        // Redirección a generación de PDF (igual que en Form)
        navigate(`/convocatorias/${id_convocatoria}/archivos`);
    } catch (err) {
        console.error('Error en handleSubmit:', err);
        if (err.response?.status === 200 || err.response?.data?.success) {
            navigate(`/convocatorias/${id_convocatoria}/archivos`);
        } else {
            setError(
                err.response?.data?.error ||
                'Error al actualizar las materias'
            );
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
                    </List>
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
                        {loading ? 'Guardando...' : 'actualizar Materias'}
                    </Button>

                </Box>
            </Paper>
        </Container>
    );
};

export default ConvocatoriaMateriasEdit;