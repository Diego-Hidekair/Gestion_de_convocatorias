// frontend/src/components/convocatorias/ConvocatoriaForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, TextField, MenuItem, Button, Grid, Typography, Card, CardContent } from '@mui/material';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const ConvocatoriaForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [convocatoria, setConvocatoria] = useState({
        nombre: '',
        fecha_inicio: new Date(), 
        fecha_fin: null,
        id_tipoconvocatoria: '',
        id_programa: '',
        tipo_jornada: 'TIEMPO COMPLETO',
        etapa_convocatoria: 'PRIMERA', 
        gestion: 'GESTION 1',
        resolucion: '',
        dictamen: '',
        perfil_profesional: '',
        materias: []
    });
    const [tiposConvocatoria, setTiposConvocatoria] = useState([]);
    const [carrerasFiltradas, setCarrerasFiltradas] = useState([]);
    const [nombreFacultad, setNombreFacultad] = useState('');
    const currentYear = new Date().getFullYear();

    useEffect(() => {
        localStorage.setItem('currentPage', '/convocatorias/new');

        const fetchData = async () => {
            try {
                const userResponse = await axios.get('http://localhost:5000/usuarios/me', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const userData = userResponse.data;

                setNombreFacultad(userData.nombre_facultad || '');
                
                const [tiposResponse, carrerasResponse] = await Promise.all([
                    axios.get('http://localhost:5000/tipos-convocatorias'),
                    axios.get(`http://localhost:5000/carreras/facultad/${userData.id_facultad}`)
                ]);

                setTiposConvocatoria(tiposResponse.data);
                setCarrerasFiltradas(carrerasResponse.data);

                if (id) {
                    const response = await axios.get(`http://localhost:5000/convocatorias/${id}`);
                    const data = response.data;
                    setConvocatoria({
                        ...data,
                        fecha_inicio: data.fecha_inicio ? new Date(data.fecha_inicio) : new Date(),
                        fecha_fin: data.fecha_fin ? new Date(data.fecha_fin) : null,
                        tipo_jornada: data.tipo_jornada,
                        etapa_convocatoria: data.etapa_convocatoria
                    });
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                alert(`Error al cargar datos: ${error.response?.data?.error || error.message}`);
            }
        };

        fetchData();
    }, [id]);

    const handleTipoConvocatoriaChange = (e) => {
        const tipoId = e.target.value;
        setConvocatoria(prev => ({
            ...prev,
            id_tipoconvocatoria: tipoId
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setConvocatoria(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleDateChange = (date) => {
        setConvocatoria(prev => ({
            ...prev,
            fecha_fin: date
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validación básica
        if (!convocatoria.id_tipoconvocatoria || !convocatoria.id_programa || !convocatoria.fecha_fin) {
            alert('Por favor complete todos los campos requeridos');
            return;
        }

        try {
            const payload = {
                ...convocatoria,
                fecha_fin: convocatoria.fecha_fin.toISOString().split('T')[0],
                id_tipoconvocatoria: parseInt(convocatoria.id_tipoconvocatoria),
                id_programa: convocatoria.id_programa.toString().trim(), // Limpiar espacios
                materias: [] // Array vacío si no hay materias
            };

            console.log('Enviando datos:', payload);

            if (id) {
                await axios.put(`http://localhost:5000/convocatorias/${id}`, payload, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                navigate('/convocatorias');
            } else {
                const response = await axios.post('http://localhost:5000/convocatorias', payload, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                
                navigate(`/convocatorias_materias/new/${response.data.id_convocatoria}`);
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert(`Error: ${error.response?.data?.error || error.message}`);
        }
    };

    return (
        <Container>
            <Card style={{ borderRadius: '15px', backgroundColor: '#E3F2FD' }}>
                <CardContent>
                    <Typography variant="h5" align="center" gutterBottom>
                        {id ? 'Editar' : 'Registrar'} Convocatoria
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    select
                                    label="Tipo de Convocatoria"
                                    fullWidth
                                    value={convocatoria.id_tipoconvocatoria}
                                    onChange={handleTipoConvocatoriaChange}
                                    required
                                >
                                    {tiposConvocatoria.map((tipo) => (
                                        <MenuItem key={tipo.id_tipoconvocatoria} value={tipo.id_tipoconvocatoria}>
                                            {tipo.nombre_convocatoria}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Fecha de Inicio (Generación)
                                </Typography>
                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    <StaticDatePicker
                                        displayStaticWrapperAs="desktop"
                                        label="Fecha de Inicio"
                                        value={convocatoria.fecha_inicio}
                                        onChange={() => {}} 
                                        readOnly
                                        renderInput={(params) => (
                                            <TextField 
                                                {...params} 
                                                fullWidth 
                                                InputProps={{ ...params.InputProps, readOnly: true }}
                                            />
                                        )}
                                    />
                                </LocalizationProvider>
                                <Typography variant="caption" display="block" gutterBottom>
                                    La fecha de inicio se establece automáticamente al crear la convocatoria
                                </Typography>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Fecha de Conclusión
                                </Typography>
                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    <StaticDatePicker
                                        displayStaticWrapperAs="desktop"
                                        label="Fecha de Fin*"
                                        value={convocatoria.fecha_fin}
                                        onChange={(date) => handleDateChange(date)}
                                        renderInput={(params) => <TextField {...params} fullWidth />}
                                    />
                                </LocalizationProvider>
                            </Grid>

                            <Grid item xs={6}>
                                <TextField
                                    label="Facultad"
                                    fullWidth
                                    value={nombreFacultad}
                                    InputProps={{ readOnly: true }}
                                />
                            </Grid>

                            <Grid item xs={6}>
                                <TextField
                                    select
                                    label="Carrera"
                                    fullWidth
                                    name="id_programa"
                                    value={convocatoria.id_programa}
                                    onChange={handleChange}
                                    required
                                >
                                    {carrerasFiltradas.map((programa) => (
                                        <MenuItem key={programa.id_programa} value={programa.id_programa}>
                                            {programa.nombre_carrera}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            <Grid item xs={6}>
                                <TextField
                                    select
                                    label="Tipo de Jornada"
                                    fullWidth
                                    name="tipo_jornada"
                                    value={convocatoria.tipo_jornada}
                                    onChange={handleChange}
                                    required
                                >
                                    <MenuItem value="TIEMPO COMPLETO">Tiempo Completo</MenuItem>
                                    <MenuItem value="TIEMPO HORARIO">Medio Tiempo</MenuItem>
                                </TextField>
                            </Grid>

                            <Grid item xs={6}>
                                <TextField
                                    select
                                    label="Etapa"
                                    fullWidth
                                    name="etapa_convocatoria"
                                    value={convocatoria.etapa_convocatoria}
                                    onChange={handleChange}
                                    required
                                >
                                    <MenuItem value="PRIMERA">Primera</MenuItem>
                                    <MenuItem value="SEGUNDA">Segunda</MenuItem>
                                    <MenuItem value="TERCERA">Tercera</MenuItem>
                                </TextField>
                            </Grid>

                            <Grid item xs={6}>
                                <TextField
                                    select
                                    label="Gestión"
                                    fullWidth
                                    name="gestion"
                                    value={convocatoria.gestion}
                                    onChange={handleChange}
                                    required
                                >
                                    <MenuItem value="GESTION 1">Gestión 1</MenuItem>
                                    <MenuItem value="GESTION 2">Gestión 2</MenuItem>
                                </TextField>
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    label="Resolución"
                                    fullWidth
                                    name="resolucion"
                                    value={convocatoria.resolucion}
                                    onChange={handleChange}
                                    required
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    label="Dictamen"
                                    fullWidth
                                    name="dictamen"
                                    value={convocatoria.dictamen}
                                    onChange={handleChange}
                                    required
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    label="Perfil Profesional"
                                    fullWidth
                                    multiline
                                    rows={4}
                                    name="perfil_profesional"
                                    value={convocatoria.perfil_profesional}
                                    onChange={handleChange}
                                    required
                                />
                            </Grid>

                            <Grid item xs={12} align="center">
                                <Button variant="contained" color="primary" type="submit" size="large">
                                    {id ? 'Actualizar' : 'Crear Convocatoria'}
                                </Button>
                                <Button 
                                    variant="outlined" 
                                    color="secondary" 
                                    onClick={() => navigate('/convocatorias')} 
                                    style={{ marginLeft: '10px' }}
                                    size="large"
                                >
                                    Cancelar
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </CardContent>
            </Card>
        </Container>
    );
};

export default ConvocatoriaForm;