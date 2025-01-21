// frontend/src/components/ConvocatoriaForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, box, Typography, Grid, TextField, MenuItem, Button, Card, CardContent, } from '@mui/material';
//import { Container, Card, CardBody, CardTitle, Button, Form, FormGroup, Label, Input, Row, Col } from 'reactstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
//import 'bootstrap/dist/css/bootstrap.min.css';
///import '../styles/convocatoria.css';

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
    });

    const [tiposConvocatoria, setTiposConvocatoria] = useState([]);
    const [programas] = useState([]);
    const [carrerasFiltradas, setCarrerasFiltradas] = useState([]);
    const [nombreFacultad, setNombreFacultad] = useState('');
    const [tituloConvocatoria, setTituloConvocatoria] = useState('');
    const [prioridad, setPrioridad] = useState('Primera');
    const [horario, setHorario] = useState('TIEMPO COMPLETO');
    const [gestion, setGestion] = useState('GESTION 1');
    const currentYear = new Date().getFullYear();

    useEffect(() => {
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
                    id_facultad: userData.id_facultad || ''
                }));

                const [tiposResponse, carrerasResponse] = await Promise.all([
                    axios.get('http://localhost:5000/tipos-convocatorias'),
                    axios.get(`http://localhost:5000/carreras/facultad/${userData.id_facultad}`),
                ]);

                setTiposConvocatoria(tiposResponse.data);
                setCarrerasFiltradas(carrerasResponse.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [id]);

    useEffect(() => {
        const carrerasFiltradas = programas.filter(
            (programa) => programa.id_facultad === parseInt(convocatoria.id_facultad)
        );
        setCarrerasFiltradas(carrerasFiltradas);
    }, [convocatoria.id_facultad, programas]);

    const handleTipoConvocatoriaChange = (e) => {
        const tipoId = e.target.value;
        setConvocatoria((prevConvocatoria) => ({
            ...prevConvocatoria,
            id_tipoconvocatoria: tipoId,
        }));

        const selectedTipo = tiposConvocatoria.find(tipo => tipo.id_tipoconvocatoria === parseInt(tipoId));
        setTituloConvocatoria(selectedTipo ? selectedTipo.nombre_convocatoria : '');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setConvocatoria((prevConvocatoria) => ({
            ...prevConvocatoria,
            [name]: value,
        }));
    };

    const handleDateChange = (name, date) => {
        setConvocatoria((prevConvocatoria) => ({
            ...prevConvocatoria,
            [name]: date,
        }));
    };

    const handleNombreAutoFill = () => {
        const programaNombre = carrerasFiltradas.find(
            (programa) => programa.id_programa === parseInt(convocatoria.id_programa)
        )?.nombre_carrera || '';

        const nombreCompleto = `${prioridad} ${tituloConvocatoria} ${horario} PARA EL PROGRAMA DE ${programaNombre} ${gestion}/${currentYear}`;

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
            prioridad,
            horario,
            gestion,
            fecha_inicio: convocatoria.fecha_inicio ? convocatoria.fecha_inicio.toISOString().split('T')[0] : null,
            fecha_fin: convocatoria.fecha_fin ? convocatoria.fecha_fin.toISOString().split('T')[0] : null,
        };
        console.log('Datos enviados al backend:', formattedConvocatoria);

        try {
            if (id) {
                await axios.put(`http://localhost:5000/convocatorias/${id}`, formattedConvocatoria);
                navigate('/convocatorias');
            } else {
                const response = await axios.post('http://localhost:5000/convocatorias', formattedConvocatoria);
                const newConvocatoriaId = response.data.id_convocatoria;
                navigate(`/convocatorias_materias/new/${newConvocatoriaId}`);
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Hubo un error al crear la convocatoria. Por favor, revisa los datos.');
        }
    };

    console.log('Estado de convocatoria después de asignar id_facultad:', convocatoria);
    
        
    return (
        <Container maxWidth="md">
            <Card>
                <CardContent>
                    <Typography variant="h5" align="center" gutterBottom>
                        {id ? 'Editar' : 'Registrar'} Convocatoria
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Tipo de Convocatoria"
                                    name="id_tipoconvocatoria"
                                    value={convocatoria.id_tipoconvocatoria}
                                    onChange={handleChange}
                                    required
                                >
                                    <MenuItem value="">
                                        <em>Seleccione un tipo</em>
                                    </MenuItem>
                                    {tiposConvocatoria.map((tipo) => (
                                        <MenuItem key={tipo.id_tipoconvocatoria} value={tipo.id_tipoconvocatoria}>
                                            {tipo.nombre_convocatoria}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Nombre de Convocatoria"
                                    name="nombre"
                                    value={convocatoria.nombre}
                                    InputProps={{ readOnly: true }}
                                    required
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Facultad"
                                    value={nombreFacultad}
                                    InputProps={{ readOnly: true }}
                                />
                            </Grid>

                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Prioridad"
                                    value={prioridad}
                                    onChange={(e) => setPrioridad(e.target.value)}
                                >
                                    {['Primera', 'Segunda', 'Tercera', 'Cuarta', 'Quinta'].map((p) => (
                                        <MenuItem key={p} value={p}>
                                            {p}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Horario"
                                    value={horario}
                                    onChange={(e) => setHorario(e.target.value)}
                                >
                                    {['TIEMPO COMPLETO', 'TIEMPO HORARIO'].map((h) => (
                                        <MenuItem key={h} value={h}>
                                            {h}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            <Grid item xs={6}>
                                <DatePicker
                                    selected={convocatoria.fecha_inicio}
                                    onChange={(date) => handleDateChange('fecha_inicio', date)}
                                    dateFormat="yyyy-MM-dd"
                                    placeholderText="Fecha de Inicio"
                                    className="form-control"
                                />
                            </Grid>

                            <Grid item xs={6}>
                                <DatePicker
                                    selected={convocatoria.fecha_fin}
                                    onChange={(date) => handleDateChange('fecha_fin', date)}
                                    dateFormat="yyyy-MM-dd"
                                    placeholderText="Fecha de Fin"
                                    className="form-control"
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Carrera"
                                    name="id_programa"
                                    value={convocatoria.id_programa}
                                    onChange={handleChange}
                                    required
                                >
                                    <MenuItem value="">
                                        <em>Seleccione una carrera</em>
                                    </MenuItem>
                                    {carrerasFiltradas.map((programa) => (
                                        <MenuItem key={programa.id_programa} value={programa.id_programa}>
                                            {programa.nombre_carrera}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            <Grid item xs={12}>
                                <Button type="submit" variant="contained" color="primary" fullWidth>
                                    {id ? 'Actualizar' : 'Siguiente'}
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