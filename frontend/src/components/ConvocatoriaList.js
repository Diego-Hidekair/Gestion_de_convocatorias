// frontend/src/components/ConvocatoriaList.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Collapse, IconButton, Paper, Typography, Box, Button, Modal, useMediaQuery, TextField, MenuItem, Select, InputLabel, FormControl } from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp, Delete, Preview, Download, Search} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
const ConvocatoriaList = () => {
  const [convocatorias, setConvocatorias] = useState([]);
  const [filteredConvocatorias, setFilteredConvocatorias] = useState([]);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState("nombre");

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
    fetchConvocatorias();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES");
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/convocatorias/${id}`);
      const updatedConvocatorias = convocatorias.filter(
        (c) => c.id_convocatoria !== id
      );
      setConvocatorias(updatedConvocatorias);
      setFilteredConvocatorias(updatedConvocatorias);
    } catch (error) {
      console.error("Error deleting convocatoria:", error);
    }
  };

  const handlePreview = (id) => {
    setPreviewUrl(`http://localhost:5000/pdf/combinado/${id}`);
    setIsPreviewModalOpen(true);
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
    }
  };

  // Filtrar convocatorias en tiempo real según el criterio seleccionado
  useEffect(() => {
    const filtered = convocatorias.filter((convocatoria) =>
      convocatoria[searchCategory]
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
    setFilteredConvocatorias(filtered);
  }, [searchQuery, searchCategory, convocatorias]);

  const Row = ({ convocatoria }) => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <TableRow>
          <TableCell>
            <IconButton
              aria-label="expand row"
              size="small"
              onClick={() => setOpen(!open)}
            >
              {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </IconButton>
          </TableCell>
          <TableCell>{convocatoria.nombre}</TableCell>
          <TableCell>{formatDate(convocatoria.fecha_inicio)}</TableCell>
          <TableCell>{formatDate(convocatoria.fecha_fin)}</TableCell>
          <TableCell>
            <IconButton
              style={{ color: "#007bff" }} // Azul
              onClick={() => handlePreview(convocatoria.id_convocatoria)}
            >
              <Preview />
            </IconButton>
            <IconButton
              style={{ color: "#28a745" }} // Verde
              onClick={() => handleDownload(convocatoria.id_convocatoria)}
            >
              <Download />
            </IconButton>
            <IconButton
              style={{ color: "#dc3545" }} // Rojo
              onClick={() => handleDelete(convocatoria.id_convocatoria)}
            >
              <Delete />
            </IconButton>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box margin={2}>
                <Typography variant="h6" gutterBottom>
                  Detalles de la convocatoria
                </Typography>
                <Typography>
                  <strong>Tipo:</strong> {convocatoria.nombre_tipoconvocatoria}
                </Typography>
                <Typography>
                  <strong>Carrera:</strong> {convocatoria.nombre_programa}
                </Typography>
                <Typography>
                  <strong>Facultad:</strong> {convocatoria.nombre_facultad}
                </Typography>
                <Typography>
                  <strong>Estado:</strong> {convocatoria.estado}
                </Typography>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </>
    );
  };

  return (
    <>
      <Typography variant="h4" component="h1" gutterBottom>
        Lista de Convocatorias
      </Typography>

      {/* Barra de búsqueda y filtrado */}
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

      <TableContainer
        component={Paper}
        sx={{
          maxWidth: isMobile ? "100%" : "80%",
          margin: "0 auto",
        }}
      >
        <Table size={isMobile ? "small" : "medium"}>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Fecha Inicio</TableCell>
              <TableCell>Fecha Fin</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredConvocatorias.map((convocatoria) => (
              <Row key={convocatoria.id_convocatoria} convocatoria={convocatoria} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default ConvocatoriaList;