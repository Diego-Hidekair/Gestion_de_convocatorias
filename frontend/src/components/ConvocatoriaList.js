// frontend/src/components/ConvocatoriaList.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Collapse, IconButton, Paper, Typography, Box, Button, Modal, useMediaQuery} from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp, Delete, Preview, Download, } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
const ConvocatoriaList = () => {
    const [convocatorias, setConvocatorias] = useState([]);
    const [previewUrl, setPreviewUrl] = useState("");
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    useEffect(() => {
        const fetchConvocatorias = async () => {
          try {
            const response = await axios.get("http://localhost:5000/convocatorias");
            setConvocatorias(response.data);
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
      setConvocatorias(convocatorias.filter((c) => c.id_convocatoria !== id));
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
              color="primary"
              onClick={() => handlePreview(convocatoria.id_convocatoria)}
            >
              <Preview />
            </IconButton>
            <IconButton
              color="success"
              onClick={() => handleDownload(convocatoria.id_convocatoria)}
            >
              <Download />
            </IconButton>
            <IconButton
              color="error"
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
            {convocatorias.map((convocatoria) => (
              <TableRow key={convocatoria.id_convocatoria}>
                <TableCell>{convocatoria.nombre}</TableCell>
                <TableCell>{new Date(convocatoria.fecha_inicio).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(convocatoria.fecha_fin).toLocaleDateString()}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handlePreview(convocatoria.id_convocatoria)}>
                    <Preview />
                  </IconButton>
                  <IconButton onClick={() => handleDownload(convocatoria.id_convocatoria)}>
                    <Download />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(convocatoria.id_convocatoria)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default ConvocatoriaList;
