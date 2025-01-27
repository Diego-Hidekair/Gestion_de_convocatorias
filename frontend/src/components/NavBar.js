import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Typography,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  ExitToApp as ExitToAppIcon,
} from "@mui/icons-material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

const NavBar = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const location = useLocation();

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  // Estilo dinámico basado en la selección
  const getItemStyle = (path) => ({
    backgroundColor: location.pathname === path ? "#fff" : "#000",
    color: location.pathname === path ? "#000" : "#fff",
    borderRadius: "4px",
    margin: "4px 0",
    transition: "all 0.3s ease",
  });

  const renderMenuItems = () => (
    <>
      {/* Elemento: Inicio */}
      <ListItem
        button
        component={Link}
        to="/home"
        style={getItemStyle("/home")}
      >
        <ListItemIcon style={{ color: location.pathname === "/home" ? "#000" : "#fff" }}>
          <HomeIcon />
        </ListItemIcon>
        <ListItemText primary="Inicio" />
      </ListItem>
      <Divider />
      {/* Elemento: Cerrar Sesión */}
      <ListItem button onClick={onLogout} style={getItemStyle("/logout")}>
        <ListItemIcon style={{ color: location.pathname === "/logout" ? "#000" : "#fff" }}>
          <ExitToAppIcon />
        </ListItemIcon>
        <ListItemText primary="Cerrar Sesión" />
      </ListItem>
    </>
  );

  return (
    <>
      {isMobile && (
        <IconButton
          onClick={toggleDrawer}
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            zIndex: 1300,
          }}
        >
          <MenuIcon />
        </IconButton>
      )}
      <Drawer
        open={isOpen}
        onClose={toggleDrawer}
        variant={isMobile ? "temporary" : "permanent"}
        sx={{
          "& .MuiDrawer-paper": {
            width: 240,
            backgroundColor: "#000", // Fondo negro por defecto
            color: "#fff", // Texto blanco por defecto
          },
        }}
      >
        <Typography
          variant="h6"
          sx={{
            padding: 2,
            color: "#fff",
            textAlign: "center",
          }}
        >
          Gestión de Convocatorias
        </Typography>
        <Divider />
        <List>{renderMenuItems()}</List>
      </Drawer>
    </>
  );
};

export default NavBar;
