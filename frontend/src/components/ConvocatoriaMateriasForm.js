// frontend/src/components/ConvocatoriaMateriasForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Typography, Button, TextField, Select, MenuItem, FormControl, InputLabel, List, ListItem, ListItemText, IconButton, Paper, Box, Alert } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';  

const ConvocatoriaMateriasForm = () => {
    const { id_convocatoria } = useParams();
    const navigate = useNavigate();
    const [materias, setMaterias] = useState([]);
    const [materiasSeleccionadas, setMateriasSeleccionadas] = useState([]);
    const [perfilProfesional, setPerfilProfesional] = useState('');
    const [materiaSeleccionada, setMateriaSeleccionada] = useState('');
    const [error, setError] = useState(null);
    const [totalHoras, setTotalHoras] = useState(0);

    useEffect(() => {
        const fetchMaterias = async () => {
            try {
                const response = await axios.get('http://localhost:5000/materias');
                setMaterias(response.data);
            } catch (err) {
                setError('Error al obtener las materias');
                console.error(err);
            }
        };
        fetchMaterias();
    }, []);

    useEffect(() => {
        const total = materiasSeleccionadas.reduce((acc, materia) => acc + materia.total_horas, 0);
        setTotalHoras(total);
    }, [materiasSeleccionadas]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (materiasSeleccionadas.length === 0 || !perfilProfesional) {
            setError('Por favor, complete todos los campos');
            return;
        }

        const tiempoTrabajo = totalHoras >= 24 ? 'TIEMPO COMPLETO' : 'TIEMPO HORARIO';

        try {
            const response = await axios.post('http://localhost:5000/convocatoria-materias/multiple', {
                id_convocatoria,
                materiasSeleccionadas: materiasSeleccionadas.map((m) => m.id_materia),
                perfil_profesional: perfilProfesional,
                tiempo_trabajo: tiempoTrabajo,
            });

            alert(`Materias agregadas exitosamente. Total de horas: ${totalHoras}`);
            const firstIdMateria = response.data.idsMaterias ? response.data.idsMaterias[0] : null;
            if (firstIdMateria) {
                navigate(`/honorarios/new/${id_convocatoria}/${firstIdMateria}`);
            } else {
                setError('No se pudo obtener el ID de la materia');
            }
        } catch (err) {
            setError('Error al agregar materias');
            console.error(err);
        }
    };

    const handleAddMateria = () => {
        const materia = materias.find((m) => m.id_materia === parseInt(materiaSeleccionada));
        if (materia && !materiasSeleccionadas.some((m) => m.id_materia === materia.id_materia)) {
            setMateriasSeleccionadas([...materiasSeleccionadas, materia]);
            setMateriaSeleccionada('');
        } else {
            setError('Materia ya seleccionada o no válida');
        }
    };

    const handleRemoveMateria = (id_materia) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar esta materia?')) {
            setMateriasSeleccionadas(materiasSeleccionadas.filter((m) => m.id_materia !== id_materia));
        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
                    Agregar Materias a la Convocatoria
                </Typography>
                {error && <Alert severity="error">{error}</Alert>}
                <form onSubmit={handleSubmit}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel id="materia-label">Seleccionar Materia</InputLabel>
                        <Select
                            labelId="materia-label"
                            value={materiaSeleccionada}
                            onChange={(e) => setMateriaSeleccionada(e.target.value)}
                        >
                            <MenuItem value="">
                                <em>Seleccione una materia</em>
                            </MenuItem>
                            {materias.map((materia) => (
                                <MenuItem key={materia.id_materia} value={materia.id_materia}>
                                    {materia.nombre}
                                </MenuItem>
                            ))}
                        </Select>
                        <Button
                            variant="contained"
                            color="secondary"
                            sx={{ mt: 2 }}
                            onClick={handleAddMateria}
                        >
                            Agregar Materia
                        </Button>
                    </FormControl>

                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                            Materias Seleccionadas:
                        </Typography>
                        <List>
                            {materiasSeleccionadas.map((materia) => (
                                <ListItem
                                    key={materia.id_materia}
                                    secondaryAction={
                                        <IconButton
                                            edge="end"
                                            color="error"
                                            onClick={() => handleRemoveMateria(materia.id_materia)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    }
                                >
                                    <ListItemText primary={materia.nombre} />
                                </ListItem>
                            ))}
                        </List>
                    </Box>

                    <Typography variant="body1" sx={{ mb: 2 }}>
                        <strong>Tiempo de Trabajo:</strong>{' '}
                        {totalHoras >= 24 ? 'TIEMPO COMPLETO' : 'TIEMPO HORARIO'}
                    </Typography>

                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <TextField
                            label="Perfil Profesional"
                            variant="outlined"
                            value={perfilProfesional}
                            onChange={(e) => setPerfilProfesional(e.target.value)}
                            placeholder="Ingrese el perfil profesional (Ej: Ingeniero Comercial)"
                            required
                        />
                    </FormControl>

                    <Button variant="contained" color="primary" type="submit" fullWidth>
                        Siguiente
                    </Button>
                </form>
            </Paper>
        </Container>
    );
};

export default ConvocatoriaMateriasForm;
