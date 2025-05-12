// frontend/src/components/convocatorias/ConvocatoriaMaterias/ConvocatoriaMateriasForm.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Typography, Button, TextField, Select, MenuItem, FormControl, InputLabel, List, ListItem, ListItemText, IconButton, Paper, Box, Alert, Divider, CircularProgress} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';

const ConvocatoriaMateriasForm = () => {
    const { id_convocatoria } = useParams();
    const navigate = useNavigate();
    const [materias, setMaterias] = useState([]);
    const [materiasSeleccionadas, setMateriasSeleccionadas] = useState([]);
    const [materiaSeleccionada, setMateriaSeleccionada] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // 1. Obtener datos de la convocatoria (para saber el programa)
                const convResponse = await axios.get(`/convocatorias/${id_convocatoria}`);
                
                // 2. Obtener materias del programa (asumiendo que tienes este endpoint)
                const materiasResponse = await axios.get(
                  `/materias/programa/${convResponse.data.id_programa}`
                );
                
                // 3. Obtener materias ya asignadas a la convocatoria
                const asignadasResponse = await axios.get(
                  `/convocatoria-materias/${id_convocatoria}/materias`
                );

                setMaterias(materiasResponse.data);
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
                    total_horas: materia.horas_teoria + materia.horas_practica 
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
        
        if (materiasSeleccionadas.length === 0) {
            setError('Debe seleccionar al menos una materia');
            return;
        }

        try {
            // Usamos la ruta correcta /convocatoria-materias/:id/materias
            await axios.post(`/convocatoria-materias/${id_convocatoria}/materias`, {
                materias: materiasSeleccionadas.map(m => ({
                    id_materia: m.id_materia,
                    total_horas: m.total_horas
                }))
            });
            
            // Redirigir a la siguiente pantalla (ajusta según tu flujo)
            navigate(`/convocatorias/${id_convocatoria}`);
            
        } catch (err) {
            setError(err.response?.data?.error || 'Error al guardar las materias');
            console.error(err);
        }
    };

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Alert severity="error">{error}</Alert>
                <Button onClick={() => window.location.reload()} sx={{ mt: 2 }}>
                    Reintentar
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="md">
            <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
                <Typography variant="h5" gutterBottom>
                    Asignar Materias a la Convocatoria
                </Typography>
                
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                
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
                                            onChange={(e) => 
                                                setMateriasSeleccionadas(prev => 
                                                    prev.map(m => 
                                                        m.id_materia === materia.id_materia 
                                                            ? { ...m, total_horas: parseInt(e.target.value) || 0 } 
                                                            : m
                                                    )
                                                )
                                            }
                                            sx={{ width: '100px', mr: 2 }}
                                            inputProps={{ min: 1 }}
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
                                    secondary={`Teoría: ${materia.horas_teoria}h - Práctica: ${materia.horas_practica}h`}
                                />
                            </ListItem>
                        ))}
                    </List>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                    <Button 
                        variant="outlined" 
                        onClick={() => navigate(`/convocatorias/${id_convocatoria}`)}
                    >
                        Volver
                    </Button>
                    <Button 
                        variant="contained" 
                        onClick={handleSubmit}
                        disabled={materiasSeleccionadas.length === 0}
                    >
                        Guardar Materias
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default ConvocatoriaMateriasForm; 