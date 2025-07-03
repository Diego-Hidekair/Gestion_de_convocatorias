// frontend/src/components/convocatorias/ConvocatoriaMaterias/ConvocatoriaMateriasForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Typography, Button, TextField, Select, MenuItem, FormControl, InputLabel, List, ListItem, ListItemText, IconButton, Paper, Box, Alert, Divider } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../../../config/axiosConfig';

const ConvocatoriaMateriasForm = () => {
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
                const convResponse = await api.get(`/convocatorias/${id_convocatoria}`);
                setConvocatoriaData(convResponse.data);
                
                const materiasResponse = await api.get(
                    `/convocatoria-materias/programa/${convResponse.data.id_programa}/materias`
                );
                
                const asignadasResponse = await api.get(
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
            await api.post(
                `/convocatoria-materias/${id_convocatoria}/materias`,
                {
                    materias: materiasSeleccionadas.map(m => ({
                        id_materia: m.id_materia,
                        total_horas: m.total_horas
                    }))
                }
            );
            navigate(`/convocatorias/${id_convocatoria}/archivos`);
        } catch (err) {
            console.error('Error en handleSubmit:', err);
            if (err.response?.status === 200 || err.response?.data?.success) {
                navigate(`/convocatorias/${id_convocatoria}/archivos`);
            } else {
                setError(
                    err.response?.data?.error ||
                    'Error al guardar las materias'
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const handleVolver = () => {
        // Verificamos si venimos de edición o creación nueva
        const isEditing = window.location.pathname.includes('/editar/');
        
        if (isEditing) {
            // Si estamos editando, volvemos a la edición
            navigate(`/convocatorias/editar/${id_convocatoria}`);
        } else {
            // Si estamos creando nueva, volvemos al formulario de creación
            navigate(`/convocatorias/nueva`);
        }
    };

    return (
        <Container maxWidth="md">
            <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
                <Typography variant="h5" gutterBottom>
                    Asignar Materias a la Convocatoria
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
                                                title: "Horas totales (puede modificar este value)"
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
                        Volver a {window.location.pathname.includes('/editar/') ? 'Editar' : 'Crear'} Convocatoria
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