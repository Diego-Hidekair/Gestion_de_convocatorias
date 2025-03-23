// frontend/src/components/ConvocatoriaList.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Paper, Typography, Box, TextField, MenuItem, Select, InputLabel, FormControl, Dialog, DialogTitle, DialogContent, DialogActions, Button, Modal, Snackbar, Alert } from "@mui/material";
import { Edit, Delete, Preview, Download, Search } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const ConvocatoriaList = () => {
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
    const [openEstadoMenu, setOpenEstadoMenu] = useState(false); 
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
                const token = localStorage.getItem("token");
                const response = await axios.get("http://localhost:5000/auth/me", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUserRole(response.data.rol); 
            } catch (error) {
                console.error("Error fetching user role:", error);
            }
        };

        fetchConvocatorias();
        fetchUserRole();
    }, []);

    const handleEstadoChange = async (id, newEstado) => {
        if (userRole !== "vicerrectorado" && userRole !== "admin") {
            setSnackbarMessage("No tiene el rol autorizado para modificar este estado.");
            setSnackbarOpen(true);
            return;
        }
        try {
            const token = localStorage.getItem("token");
            await axios.patch(
                `http://localhost:5000/convocatorias/${id}/estado`,
                { estado: newEstado },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setConvocatorias(convocatorias.map(convocatoria =>
                convocatoria.id_convocatoria === id ? { ...convocatoria, estado: newEstado } : convocatoria
            ));
            setSnackbarMessage("Estado actualizado correctamente.");
            setSnackbarOpen(true);
        } catch (error) {
            console.error("Error updating estado:", error);
            setSnackbarMessage("No se pudo actualizar el estado.");
            setSnackbarOpen(true);
        }
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
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase())
        );
        setFilteredConvocatorias(filtered);
    }, [searchQuery, searchCategory, convocatorias]);

    const getEstadoColor = (estado) => {
        switch (estado) {
            case "Para Revisión":
                return "#ffc107";
            case "En Revisión":
                return "#007bff";
            case "Observado":
                return "#dc3545";
            case "Revisado":
                return "#28a745";
            default:
                return "#6c757d";
        }
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
                                            style={{ backgroundColor: getEstadoColor(convocatoria.estado), color: "#fff" }}
                                        >
                                            <MenuItem value="Para Revisión">Para Revisión</MenuItem>
                                            <MenuItem value="En Revisión">En Revisión</MenuItem>
                                            <MenuItem value="Observado">Observado</MenuItem>
                                            <MenuItem value="Revisado">Revisado</MenuItem>
                                        </Select>
                                    </FormControl>
                                </TableCell>
                                <TableCell>
                                    <IconButton
                                        style={{ color: "#007bff" }}
                                        onClick={() => handlePreview(convocatoria.id_convocatoria)}
                                    >
                                        <Preview />
                                    </IconButton>
                                    <IconButton
                                        style={{ color: "#28a745" }}
                                        onClick={() => handleDownload(convocatoria.id_convocatoria)}
                                    >
                                        <Download />
                                    </IconButton>
                                    <IconButton
                                        style={{ color: "#ffc107" }}
                                        onClick={() => handleEdit(convocatoria.id_convocatoria)}
                                    >
                                        <Edit />
                                    </IconButton>
                                    <IconButton
                                        style={{ color: "#dc3545" }}
                                        onClick={() => handleDeleteClick(convocatoria.id_convocatoria)}
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
                <Box sx={{ width: "80%", margin: "auto", marginTop: "5%", bgcolor: "background.paper", p: 4 }}>
                    <iframe src={previewUrl} width="100%" height="600px" title="Vista previa del PDF" />
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
                    <Button onClick={handleDeleteConfirm} color="secondary">
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
            >
                <Alert onClose={() => setSnackbarOpen(false)} severity="info" sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </>
    );
};

export default ConvocatoriaList;