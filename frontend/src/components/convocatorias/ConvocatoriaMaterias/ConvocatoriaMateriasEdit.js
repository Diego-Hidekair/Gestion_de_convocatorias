// frontend/src/components/convocatorias/ConvocatoriaMaterias/ConvocatoriaMateriasEdit.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, TextField, Button, Typography, Paper, Box, 
  Alert, CircularProgress, Divider 
} from '@mui/material';
import api from '../../../config/axiosConfig';

const ConvocatoriaMateriasEdit = () => {    
    const { id_convocatoria, id_materia } = useParams();
    const navigate = useNavigate();
    const [materia, setMateria] = useState(null);
    const [convocatoria, setConvocatoria] = useState(null);
    const [perfilProfesional, setPerfilProfesional] = useState('');
    const [totalHoras, setTotalHoras] = useState(0);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [convResponse, matResponse] = await Promise.all([
                    api.get(`/convocatorias/${id_convocatoria}`),
                    api.get(`/convocatoria-materias/${id_convocatoria}/materias/${id_materia}`)
                ]);
                
                setConvocatoria(convResponse.data);
                setMateria(matResponse.data);
                setPerfilProfesional(matResponse.data.perfil_profesional || '');
                setTotalHoras(matResponse.data.total_horas || 0);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.error || 'Error al obtener los datos');
                console.error(err);
                setLoading(false);
            }
        };
        fetchData();
    }, [id_convocatoria, id_materia]);
 
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await api.put(
                `/convocatoria-materias/${id_convocatoria}/materias/${id_materia}`, 
                {
                    perfil_profesional: perfilProfesional,
                    total_horas: totalHoras
                }
            );
            navigate(`/convocatoria-materias/${id_convocatoria}/materias`);
        } catch (err) {
            setError(err.response?.data?.error || 'Error al actualizar la materia');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Container>
        );
    }

    if (!materia || !convocatoria) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Alert severity="error">
                    {error || 'No se pudo cargar la información requerida'}
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
                    Editar Materia de la Convocatoria
                </Typography>
                
                {convocatoria && (
                    <Box sx={{ mb: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                        <Typography variant="subtitle1">
                            <strong>Convocatoria:</strong> {convocatoria.nombre_conv}
                        </Typography>
                    </Box>
                )}
                
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                
                <Box component="form" onSubmit={handleSubmit}>
                    <Typography variant="h6" gutterBottom>
                        {materia.materia} ({materia.cod_materia})
                    </Typography>
                    
                    <TextField
                        label="Perfil Profesional"
                        fullWidth
                        value={perfilProfesional}
                        onChange={(e) => setPerfilProfesional(e.target.value)}
                        margin="normal"
                        multiline
                        rows={3}
                        required
                    />
                    
                    <TextField
                        label="Total Horas"
                        type="number"
                        fullWidth
                        value={totalHoras}
                        onChange={(e) => {
                            const value = parseInt(e.target.value) || 0;
                            if (value > 0) setTotalHoras(value);
                        }}
                        margin="normal"
                        required
                        inputProps={{ min: 1 }}
                    />
                    
                    <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
                        <Button 
                            variant="outlined" 
                            onClick={() => navigate(`/convocatoria-materias/${id_convocatoria}/materias`)}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button 
                            type="submit" 
                            variant="contained" 
                            color="primary"
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Guardar Cambios'}
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default ConvocatoriaMateriasEdit;