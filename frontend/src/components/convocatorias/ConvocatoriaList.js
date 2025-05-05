// frontend/src/components/convocatorias/ConvocatoriaList.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Paper, Typography, Box, TextField, MenuItem, Select, InputLabel, FormControl, Dialog, DialogTitle, DialogContent, DialogActions, Button, Modal, Snackbar, Alert, Badge  } from "@mui/material";
import { Edit, Delete, Preview, Download, Search, Comment } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom"; 

const ConvocatoriaList = () => {
    const { estado: estadoParam } = useParams();
    const [convocatorias, setConvocatorias] = useState([]);
    const [filteredConvocatorias, setFilteredConvocatorias] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchCategory, setSearchCategory] = useState("nombre");
    const [previewUrl, setPreviewUrl] = useState("");
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [convocatoriaToDelete, setConvocatoriaToDelete] = useState(null);
    const [userRole, setUserRole] = useState("");
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [selectedEstado, setSelectedEstado] = useState(null);
    const [comentarioModalOpen, setComentarioModalOpen] = useState(false);
    const [comentario, setComentario] = useState("");
    const [convocatoriaId, setConvocatoriaId] = useState(null);
    const [isEditingComentario, setIsEditingComentario] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchConvocatorias = async () => {
            try {
                const response = await axios.get("http://localhost:5000/convocatorias");
                setConvocatorias(response.data);
                setFilteredConvocatorias(response.data);
            } catch (error) {
                console.error("Error fetching convocatorias:", error);
            }
        };

        const fetchUserRole = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:5000/api/auth/me', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUserRole(response.data.rol);
            } catch (error) {
                console.error('Error fetching user role:', error);
            }
        };

        fetchConvocatorias();
        fetchUserRole();
    }, []);

    const updateConvocatoriaEstado = async (id, estado, comentario = null) => {
        try {
            const token = localStorage.getItem("token");
            const payload = { estado };
            
            if (comentario) {
                payload.comentario_observado = comentario;
            }

            await axios.patch(
                `http://localhost:5000/convocatorias/${id}/estado`,
                payload,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setConvocatorias(convocatorias.map(convocatoria =>
                convocatoria.id_convocatoria === id 
                    ? { 
                        ...convocatoria, 
                        estado: estado,
                        ...(comentario ? { comentario_observado: comentario } : {}) 
                    } 
                    : convocatoria
            ));

            setSnackbarMessage("Estado actualizado correctamente.");
            setSnackbarOpen(true);
        } catch (error) {
            console.error("Error updating estado:", error);
            setSnackbarMessage("No se pudo actualizar el estado.");
            setSnackbarOpen(true);
        }
    };

    const updateComentario = async (id, comentario) => {
        try {
            const token = localStorage.getItem("token");
            await axios.patch(
                `http://localhost:5000/convocatorias/${id}/comentario`,
                { comentario_observado: comentario },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setConvocatorias(convocatorias.map(convocatoria =>
                convocatoria.id_convocatoria === id 
                    ? { ...convocatoria, comentario_observado: comentario } 
                    : convocatoria
            ));

            setSnackbarMessage("Comentario actualizado correctamente.");
            setSnackbarOpen(true);
        } catch (error) {
            console.error("Error updating comentario:", error);
            setSnackbarMessage("No se pudo actualizar el comentario.");
            setSnackbarOpen(true);
        }
    };

    const handleEstadoChange = async (id, newEstado) => {
        if (userRole !== "tecnico_vicerrectorado" && userRole !== "vicerrectorado" && userRole !== "admin") {
            setSnackbarMessage("No tiene el rol autorizado para modificar este estado.");
            setSnackbarOpen(true);
            return;
        }

        if (newEstado === "Observado" || newEstado === "Devuelto") {
            setConvocatoriaId(id);
            setSelectedEstado(newEstado);
            setIsEditingComentario(false);
            setComentarioModalOpen(true);
        } else {
            await updateConvocatoriaEstado(id, newEstado);
        }
    };

    const handleComentarioSubmit = async () => {
        if (!comentario) {
            setSnackbarMessage("El comentario no puede estar vacío.");
            setSnackbarOpen(true);
            return;
        }

        try {
            if (isEditingComentario) {
                await updateComentario(convocatoriaId, comentario);
            } else {
                await updateConvocatoriaEstado(convocatoriaId, selectedEstado, comentario);
            }
            
            handleComentarioClose();
        } catch (error) {
            console.error("Error al guardar comentario:", error);
            setSnackbarMessage("Error al guardar el comentario.");
            setSnackbarOpen(true);
        }
    };

    const handleComentarioClose = () => {
        setComentarioModalOpen(false);
        setComentario("");
        setSelectedEstado(null);
        setIsEditingComentario(false);
    };

    const handleEditComentario = (convocatoria) => {
        setConvocatoriaId(convocatoria.id_convocatoria);
        setComentario(convocatoria.comentario_observado);
        setIsEditingComentario(true);
        setComentarioModalOpen(true);
    };

    const handleEdit = (id) => {
        navigate(`/convocatorias/edit/${id}`);
    };

    const handleDeleteClick = (id) => {
        setConvocatoriaToDelete(id);
        setDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await axios.delete(`http://localhost:5000/convocatorias/${convocatoriaToDelete}`);
            const updatedConvocatorias = convocatorias.filter(
                (c) => c.id_convocatoria !== convocatoriaToDelete
            );
            setConvocatorias(updatedConvocatorias);
            setFilteredConvocatorias(updatedConvocatorias);
            setDeleteModalOpen(false);
            setSnackbarMessage("Convocatoria eliminada correctamente.");
            setSnackbarOpen(true);
        } catch (error) {
            console.error("Error deleting convocatoria:", error);
            setSnackbarMessage("Hubo un error al eliminar la convocatoria.");
            setSnackbarOpen(true);
        }
    };

    const handleDeleteCancel = () => {
        setConvocatoriaToDelete(null);
        setDeleteModalOpen(false);
    };

    const handlePreview = async (id) => {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.get(`http://localhost:5000/pdf/combinado/ver/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                responseType: "blob",
            });

            const pdfBlob = new Blob([response.data], { type: "application/pdf" });
            const pdfUrl = URL.createObjectURL(pdfBlob);
            setPreviewUrl(pdfUrl);
            setIsPreviewModalOpen(true);
        } catch (error) {
            console.error("Error al obtener el PDF:", error);
            setSnackbarMessage("No se pudo cargar el PDF. Verifica tu conexión o intenta más tarde.");
            setSnackbarOpen(true);
        }
    };

    const handleDownload = async (id) => {
        try {
            const response = await axios.get(
                `http://localhost:5000/pdf/download/${id}`,
                { responseType: "blob" }
            );
            const url = URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `documento_${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error("Error descargando el documento:", error);
            setSnackbarMessage("Error al descargar el documento.");
            setSnackbarOpen(true);
        }
    };

    useEffect(() => {
        const filtered = convocatorias.filter((convocatoria) =>
            convocatoria[searchCategory]
                ?.toString()
                .toLowerCase()
                .includes(searchQuery.toLowerCase())
        );
        setFilteredConvocatorias(filtered);
    }, [searchQuery, searchCategory, convocatorias]);

    const getEstadoColor = (estado) => {
        switch (estado) {
            case "Para Revisión":
                return "#ffc107"; // Amarillo
            case "En Revisión":
                return "#17a2b8"; // Cyan
            case "Observado":
                return "#fd7e14"; // Naranja
            case "Revisado":
                return "#28a745"; // Verde
            case "Aprobado":
                return "#20c997"; // Verde claro
            case "Devuelto":
                return "#dc3545"; // Rojo
            case "Para Publicar":
                return "#007bff"; // Azul
            default:
                return "#6c757d"; // Gris
        }
    };

    const getEstadoTextColor = (estado) => {
        // Para asegurar buen contraste con el fondo
        return ["Para Revisión", "Observado"].includes(estado) ? "#ffffff" : "#ffffff";
    };

    return (
        <>
            <Typography variant="h4" component="h1" gutterBottom>
                Lista de Convocatorias
            </Typography>
            <Box display="flex" justifyContent="center" alignItems="center" mb={2} gap={2}>
                <TextField
                    label="Buscar..."
                    variant="outlined"
                    size="small"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: <Search color="disabled" />,
                    }}
                />
                <FormControl variant="outlined" size="small">
                    <InputLabel>Categoría</InputLabel>
                    <Select
                        value={searchCategory}
                        onChange={(e) => setSearchCategory(e.target.value)}
                        label="Categoría"
                    >
                        <MenuItem value="nombre">Nombre</MenuItem>
                        <MenuItem value="fecha_inicio">Fecha de Inicio</MenuItem>
                        <MenuItem value="nombre_programa">Carrera</MenuItem>
                        <MenuItem value="nombre_facultad">Facultad</MenuItem>
                    </Select>
                </FormControl>
            </Box>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Nombre</TableCell>
                            <TableCell>Fecha Inicio</TableCell>
                            <TableCell>Fecha Fin</TableCell>
                            <TableCell>Estado</TableCell>
                            <TableCell>Comentario</TableCell>
                            <TableCell>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredConvocatorias.map((convocatoria) => (
                            <TableRow key={convocatoria.id_convocatoria}>
                                <TableCell>{convocatoria.nombre}</TableCell>
                                <TableCell>{convocatoria.fecha_inicio}</TableCell>
                                <TableCell>{convocatoria.fecha_fin}</TableCell>
                                <TableCell>
                                    <FormControl variant="outlined" size="small">
                                        <Select
                                            value={convocatoria.estado}
                                            onChange={(e) => handleEstadoChange(convocatoria.id_convocatoria, e.target.value)}
                                            style={{ 
                                                backgroundColor: getEstadoColor(convocatoria.estado), 
                                                color: getEstadoTextColor(convocatoria.estado),
                                                minWidth: "150px",
                                                fontWeight: "bold"
                                            }}
                                        >
                                            <MenuItem value="Para Revisión">Para Revisión</MenuItem>
                                            <MenuItem value="En Revisión">En Revisión</MenuItem>
                                            <MenuItem value="Observado">Observado</MenuItem>
                                            <MenuItem value="Revisado">Revisado</MenuItem>
                                            {userRole === "vicerrectorado" || userRole === "admin" ? (
                                                <>
                                                    <MenuItem value="Aprobado">Aprobado</MenuItem>
                                                    <MenuItem value="Devuelto">Devuelto</MenuItem>
                                                    <MenuItem value="Para Publicar">Para Publicar</MenuItem>
                                                </>
                                            ) : null}
                                        </Select>
                                    </FormControl>
                                </TableCell>
                                <TableCell>
                                    {(convocatoria.comentario_observado || ["Observado", "Devuelto"].includes(convocatoria.estado)) && (
                                        <IconButton
                                            style={{ color: "#007bff" }}
                                            onClick={() => handleEditComentario(convocatoria)}
                                            title={convocatoria.comentario_observado ? "Editar comentario" : "Agregar comentario"}
                                        >
                                            <Comment />
                                        </IconButton>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <IconButton
                                        style={{ color: "#007bff" }}
                                        onClick={() => handlePreview(convocatoria.id_convocatoria)}
                                        title="Vista previa"
                                    >
                                        <Preview />
                                    </IconButton>
                                    <IconButton
                                        style={{ color: "#28a745" }}
                                        onClick={() => handleDownload(convocatoria.id_convocatoria)}
                                        title="Descargar"
                                    >
                                        <Download />
                                    </IconButton>
                                    <IconButton
                                        style={{ color: "#ffc107" }}
                                        onClick={() => handleEdit(convocatoria.id_convocatoria)}
                                        title="Editar"
                                    >
                                        <Edit />
                                    </IconButton>
                                    <IconButton
                                        style={{ color: "#dc3545" }}
                                        onClick={() => handleDeleteClick(convocatoria.id_convocatoria)}
                                        title="Eliminar"
                                    >
                                        <Delete />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Modal open={isPreviewModalOpen} onClose={() => setIsPreviewModalOpen(false)}>
                <Box sx={{ 
                    width: "80%", 
                    margin: "auto", 
                    marginTop: "5%", 
                    bgcolor: "background.paper", 
                    p: 4,
                    borderRadius: 2,
                    boxShadow: 24
                }}>
                    <iframe 
                        src={previewUrl} 
                        width="100%" 
                        height="600px" 
                        title="Vista previa del PDF"
                        style={{ border: "none" }}
                    />
                </Box>
            </Modal>

            <Dialog open={deleteModalOpen} onClose={handleDeleteCancel}>
                <DialogTitle>Confirmar Eliminación</DialogTitle>
                <DialogContent>
                    <Typography>
                        ¿Estás seguro de que deseas eliminar esta convocatoria?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel} color="primary">
                        Cancelar
                    </Button>
                    <Button onClick={handleDeleteConfirm} color="error">
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={comentarioModalOpen} onClose={handleComentarioClose} fullWidth maxWidth="sm">
                <DialogTitle>
                    {isEditingComentario ? "Editar Comentario" : `Agregar Comentario para estado '${selectedEstado}'`}
                </DialogTitle>
                <DialogContent>
                    {!isEditingComentario && (
                        <Typography variant="body1" gutterBottom>
                            Por favor ingrese los motivos por los cuales la convocatoria está siendo {selectedEstado === "Devuelto" ? "devuelta" : "observada"}:
                        </Typography>
                    )}
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Comentario"
                        type="text"
                        fullWidth
                        variant="outlined"
                        multiline
                        rows={4}
                        value={comentario}
                        onChange={(e) => setComentario(e.target.value)}
                        required
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleComentarioClose} color="primary">
                        Cancelar
                    </Button>
                    <Button 
                        onClick={handleComentarioSubmit} 
                        color="primary"
                        variant="contained"
                        disabled={!comentario}
                    >
                        {isEditingComentario ? "Actualizar Comentario" : "Guardar y Cambiar Estado"}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert 
                    onClose={() => setSnackbarOpen(false)} 
                    severity="info" 
                    sx={{ width: '100%' }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </>
    );
};

export default ConvocatoriaList;