// frontend/src/components/NavBar.js
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  IconButton,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Book as BookIcon,
  ContentPaste as ClipboardIcon,
  CheckBox as CheckBoxIcon,
  Person as PersonIcon,
  People as PeopleIcon,
  ExitToApp as ExitToAppIcon,
} from "@mui/icons-material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

const NavBar = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState("");
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      const decodedToken = jwtDecode(token);
      setRole(decodedToken.rol);
    }
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    if (onLogout) onLogout();
  };

  // Estilos dinámicos de los elementos del menú
  const getItemStyle = (path) => ({
    backgroundColor: location.pathname === path ? "#fff" : "transparent",
    color: location.pathname === path ? "#000" : "#fff",
    borderRadius: "4px",
    margin: "4px 0",
    transition: "all 0.3s ease",
  });

  const renderMenuItems = () => {
    const commonItems = [
      role === "admin" && (
        <ListItem
          button
          component={Link}
          to="/usuarios"
          key="usuarios"
          style={getItemStyle("/usuarios")}
        >
          <ListItemIcon style={{ color: location.pathname === "/usuarios" ? "#000" : "#fff" }}>
            <PeopleIcon />
          </ListItemIcon>
          <ListItemText primary="Usuarios" />
        </ListItem>
      ),
      <ListItem
        button
        component={Link}
        to="/perfil"
        key="perfil"
        style={getItemStyle("/perfil")}
      >
        <ListItemIcon style={{ color: location.pathname === "/perfil" ? "#000" : "#fff" }}>
          <PersonIcon />
        </ListItemIcon>
        <ListItemText primary="Perfil de Usuario" />
      </ListItem>,
    ];

    const roleSpecificItems = {
      admin: [
        <ListItem
          button
          component={Link}
          to="/facultades"
          key="facultades"
          style={getItemStyle("/facultades")}
        >
          <ListItemIcon style={{ color: location.pathname === "/facultades" ? "#000" : "#fff" }}>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary="Facultades" />
        </ListItem>,
        <ListItem
          button
          component={Link}
          to="/carreras"
          key="carreras"
          style={getItemStyle("/carreras")}
        >
          <ListItemIcon style={{ color: location.pathname === "/carreras" ? "#000" : "#fff" }}>
            <BookIcon />
          </ListItemIcon>
          <ListItemText primary="Carreras" />
        </ListItem>,
      ],
      secretaria: [
        <ListItem
          button
          component={Link}
          to="/convocatorias"
          key="convocatorias"
          style={getItemStyle("/convocatorias")}
        >
          <ListItemIcon style={{ color: location.pathname === "/convocatorias" ? "#000" : "#fff" }}>
            <ClipboardIcon />
          </ListItemIcon>
          <ListItemText primary="Convocatorias" />
        </ListItem>,
        <ListItem
          button
          component={Link}
          to="/convocatorias/crear"
          key="crear-convocatoria"
          style={getItemStyle("/convocatorias/crear")}
        >
          <ListItemIcon style={{ color: location.pathname === "/convocatorias/crear" ? "#000" : "#fff" }}>
            <CheckBoxIcon />
          </ListItemIcon>
          <ListItemText primary="Crear Convocatoria" />
        </ListItem>,
      ],
    };

    return [
      ...(roleSpecificItems[role] || []),
      ...commonItems,
      <Divider key="divider" />,
      <ListItem button onClick={handleLogout} key="logout" style={getItemStyle("/logout")}>
        <ListItemIcon style={{ color: "#fff" }}>
          <ExitToAppIcon />
        </ListItemIcon>
        <ListItemText primary="Cerrar Sesión" />
      </ListItem>,
    ];
  };

  return (
    <div>
      {isLoggedIn && (
        <>
          {isMobile && (
            <IconButton
              onClick={toggleDrawer}
              style={{
                position: "absolute",
                top: 10,
                left: 10,
                zIndex: 1300,
                color: "#fff",
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
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                color: "#fff",
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
      )}
    </div>
  );
};

export default NavBar;
