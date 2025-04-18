// frontend/src/components/ConvocatoriaForm.js
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
        fecha_inicio: null,
        fecha_fin: null,
        id_tipoconvocatoria: '',
        id_programa: '',
        id_facultad: '',
        horario: 'TIEMPO COMPLETO',
        prioridad: 'PRIMERA', 
        gestion: 'GESTION 1', 
    });

    const [tiposConvocatoria, setTiposConvocatoria] = useState([]);
    const [carrerasFiltradas, setCarrerasFiltradas] = useState([]);
    const [nombreFacultad, setNombreFacultad] = useState('');
    const [tituloConvocatoria, setTituloConvocatoria] = useState('');
    const currentYear = new Date().getFullYear();

    useEffect(() => {
        // Guardar la página actual en localStorage
        localStorage.setItem('currentPage', '/convocatorias/new');

        const today = new Date();
        if (!id) {
            setConvocatoria((prevConvocatoria) => ({
                ...prevConvocatoria,
                fecha_inicio: today,
            }));
        }
        if (id) {
            const fetchConvocatoria = async () => {
                try {
                    const response = await axios.get(`http://localhost:5000/convocatorias/${id}`);
                    const data = response.data;
                    setConvocatoria({
                        ...data,
                        fecha_inicio: data.fecha_inicio ? new Date(data.fecha_inicio) : null,
                        fecha_fin: data.fecha_fin ? new Date(data.fecha_fin) : null,
                    });
                } catch (error) {
                    console.error('Error fetching convocatoria:', error);
                }
            };
            fetchConvocatoria();
        }

        const fetchData = async () => {
            try {
                const userResponse = await axios.get('http://localhost:5000/usuarios/me');
                const userData = userResponse.data;

                const nombreFacultad = userData.nombre_facultad || '';
                setNombreFacultad(nombreFacultad);
                setConvocatoria((prevConvocatoria) => ({
                    ...prevConvocatoria,
                    id_facultad: userData.id_facultad || '',
                }));

                const [tiposResponse, carrerasResponse] = await Promise.all([
                    axios.get('http://localhost:5000/tipos-convocatorias'),
                    axios.get(`http://localhost:5000/carreras/facultad/${nombreFacultad}`),
                ]);

                setTiposConvocatoria(tiposResponse.data);
                setCarrerasFiltradas(carrerasResponse.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [id]);

    const handleTipoConvocatoriaChange = (e) => {
        const tipoId = e.target.value;
        setConvocatoria((prevConvocatoria) => ({
            ...prevConvocatoria,
            id_tipoconvocatoria: tipoId,
        }));

        const selectedTipo = tiposConvocatoria.find((tipo) => tipo.id_tipoconvocatoria === parseInt(tipoId));
        setTituloConvocatoria(selectedTipo ? selectedTipo.titulo : '');
        handleNombreAutoFill();
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setConvocatoria((prevConvocatoria) => ({
            ...prevConvocatoria,
            [name]: value,
        }));
        handleNombreAutoFill();
    };

    const handleDateChange = (name, date) => {
        setConvocatoria((prevConvocatoria) => ({
            ...prevConvocatoria,
            [name]: date,
        }));
    };

    const handleNombreAutoFill = () => {
        const programaNombre =
            carrerasFiltradas.find((p) => p.id_programa === parseInt(convocatoria.id_programa))?.nombre_carrera || '';
        const nombreCompleto = `${convocatoria.prioridad} ${tituloConvocatoria} ${convocatoria.horario} PARA EL PROGRAMA DE ${programaNombre} ${convocatoria.gestion}/${currentYear}`;

        setConvocatoria((prevConvocatoria) => ({
            ...prevConvocatoria,
            nombre: nombreCompleto,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        handleNombreAutoFill();

        const formattedConvocatoria = {
            ...convocatoria,
            fecha_inicio: convocatoria.fecha_inicio ? convocatoria.fecha_inicio.toISOString().split('T')[0] : null,
            fecha_fin: convocatoria.fecha_fin ? convocatoria.fecha_fin.toISOString().split('T')[0] : null,
        };

        console.log('Datos enviados:', formattedConvocatoria); // Verificar datos

        try {
            if (id) {
                await axios.put(`http://localhost:5000/convocatorias/${id}`, formattedConvocatoria);
                navigate('/convocatorias');
            } else {
                const response = await axios.post('http://localhost:5000/convocatorias', formattedConvocatoria);
                const newConvocatoriaId = response.data.id_convocatoria;

                localStorage.removeItem('convocatoriaState');
                localStorage.setItem('currentPage', `/convocatorias_materias/new/${newConvocatoriaId}`);
                navigate(`/convocatorias_materias/new/${newConvocatoriaId}`);
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert(`Hubo un error al crear la convocatoria: ${error.response?.data?.error || error.message}`);
        }
    };

    useEffect(() => {
        if (convocatoria.nombre && convocatoria.fecha_inicio && convocatoria.fecha_fin) {
            localStorage.setItem('convocatoriaState', JSON.stringify(convocatoria));
        }
    }, [convocatoria]);

    useEffect(() => {
        const savedState = JSON.parse(localStorage.getItem('convocatoriaState'));
        if (savedState) {
            setConvocatoria(savedState);
        }
    }, []);

    const handleCancel = () => {
        localStorage.removeItem('convocatoriaState');
        localStorage.removeItem('currentPage');
        setConvocatoria({
            nombre: '',
            fecha_inicio: null,
            fecha_fin: null,
            id_tipoconvocatoria: '',
            id_programa: '',
            id_facultad: '',
            horario: 'TIEMPO COMPLETO',
            prioridad: 'PRIMERA',
            gestion: 'GESTION 1',
        });
        navigate('/');
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
                            <Grid item xs={12}>
                                <TextField
                                    label="Nombre de Convocatoria"
                                    fullWidth
                                    value={convocatoria.nombre}
                                    InputProps={{ readOnly: true }}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Fecha de Publicación
                                </Typography>
                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    <StaticDatePicker
                                        displayStaticWrapperAs="desktop"
                                        label="Fecha de Inicio"
                                        value={convocatoria.fecha_inicio}
                                        onChange={(date) => handleDateChange('fecha_inicio', date)}
                                        inputFormat="yyyy-MM-dd"
                                        renderInput={(params) => <TextField {...params} fullWidth style={{ borderRadius: '10px' }} />}
                                    />
                                </LocalizationProvider>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Fecha de Conclusión de la Convocatoria
                                </Typography>
                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    <StaticDatePicker
                                        displayStaticWrapperAs="desktop"
                                        label="Fecha de Fin"
                                        value={convocatoria.fecha_fin}
                                        onChange={(date) => handleDateChange('fecha_fin', date)}
                                        inputFormat="yyyy-MM-dd"
                                        renderInput={(params) => <TextField {...params} fullWidth style={{ borderRadius: '10px' }} />}
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
                                    onChange={(e) => {
                                        handleChange(e);
                                        handleNombreAutoFill();
                                    }}
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
                                    label="Horario"
                                    fullWidth
                                    name="horario"
                                    value={convocatoria.horario}
                                    onChange={handleChange}
                                    required
                                >
                                    <MenuItem value="TIEMPO COMPLETO">Tiempo Completo</MenuItem>
                                    <MenuItem value="MEDIO TIEMPO">Medio Tiempo</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    select
                                    label="Prioridad"
                                    fullWidth
                                    name="prioridad"
                                    value={convocatoria.prioridad}
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
                            <Grid item xs={12} align="center">
                                <Button variant="contained" color="primary" type="submit">
                                    {id ? 'Actualizar' : 'Siguiente'}
                                </Button>
                                <Button variant="contained" color="secondary" onClick={handleCancel} style={{ marginLeft: '10px' }}>
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