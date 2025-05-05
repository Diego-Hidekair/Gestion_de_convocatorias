// frontend/src/components/convocatorias/ConvocatoriaMaterias/ConvocatoriaMateriasEdit.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, TextField, Button, Typography, Paper, Box, Alert, CircularProgress 
} from '@mui/material';

const ConvocatoriaMateriasEdit = () => {    
    const { id_convocatoria, id_materia } = useParams();
    const navigate = useNavigate();
    const [materia, setMateria] = useState(null);
    const [perfilProfesional, setPerfilProfesional] = useState('');
    const [totalHoras, setTotalHoras] = useState(0);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMateria = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/convocatoria_materias/${id_materia}`);
                setMateria(response.data);
                setPerfilProfesional(response.data.perfil_profesional || '');
                setTotalHoras(response.data.total_horas || 0);
                setLoading(false);
            } catch (err) {
                setError('Error al obtener los datos de la materia');
                console.error(err);
                setLoading(false);
            }
        };
        fetchMateria();
    }, [id_materia]);
 
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:5000/convocatoria_materias/${id_materia}`, {
                perfil_profesional: perfilProfesional,
                total_horas: totalHoras
            });
            
            navigate(`/honorarios/new/${id_convocatoria}/${id_materia}`);
        } catch (err) {
            setError('Error al editar la materia');
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

    if (!materia) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Alert severity="error">No se pudo cargar la información de la materia</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="md">
            <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
                <Typography variant="h5" gutterBottom>
                    Editar Materia de la Convocatoria
                </Typography>
                
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                
                <Box component="form" onSubmit={handleSubmit}>
                    <TextField
                        label="Perfil Profesional"
                        fullWidth
                        value={perfilProfesional}
                        onChange={(e) => setPerfilProfesional(e.target.value)}
                        margin="normal"
                        required
                    />
                    
                    <TextField
                        label="Total Horas"
                        type="number"
                        fullWidth
                        value={totalHoras}
                        onChange={(e) => setTotalHoras(Number(e.target.value))}
                        margin="normal"
                        required
                        inputProps={{ min: 1 }}
                    />
                    
                    <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
                        <Button 
                            variant="outlined" 
                            onClick={() => navigate(-1)}
                        >
                            Cancelar
                        </Button>
                        <Button 
                            type="submit" 
                            variant="contained" 
                            color="primary"
                        >
                            Guardar Cambios
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default ConvocatoriaMateriasEdit;