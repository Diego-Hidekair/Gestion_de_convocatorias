// frontend/src/components/NavBar.js
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, Typography, IconButton, Box, Collapse } from "@mui/material";
import { Menu as MenuIcon, Home as HomeIcon, Book as BookIcon, ContentPaste as ClipboardIcon, CheckBox as CheckBoxIcon, Person as  PersonIcon, People as PeopleIcon, ExitToApp as ExitToAppIcon, ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon, Verified as VerifiedIcon, Notifications as NotificationsIcon,ExpandLess, ExpandMore } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import NotificacionBadge from './NotificacionBadge';


const NavBar = ({
  onLogout,
  userRole,
  isExpanded,
  setIsExpanded,
  drawerWidthExpanded = 240,
  drawerWidthCollapsed = 70,
  isDrawerOpen,
  setIsDrawerOpen
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState("");
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [openEstadoMenu, setOpenEstadoMenu] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      const decodedToken = jwtDecode(token);
      setRole(decodedToken.rol || userRole);
    }
  }, [userRole]);

  useEffect(() => {
    if (isMobile) {
      setIsDrawerOpen(false);
    }
  }, [location, isMobile, setIsDrawerOpen]);

  const toggleDrawer = () => {
    setIsDrawerOpen(prev => !prev);
  };

  const toggleDrawerExpanded = () => {
    setIsExpanded(prev => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    if (onLogout) onLogout();
  };

  const getItemStyle = (path) => ({
    backgroundColor: location.pathname === path ? "#fff" : "transparent",
    color: location.pathname === path ? "#000" : "#fff",
    borderRadius: "4px",
    margin: "4px 0",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: location.pathname === path ? "#fff" : "rgba(255, 255, 255, 0.1)",
    },
  });
  const renderEstadoFilter = () => {
  let estadosConvocatoria = [];

  if (role === "secretaria_de_decanatura") {
    estadosConvocatoria = [
      "Para Revisión",
      "En Revisión",
      "Observado",
      "Revisado"
    ];
  } else if (role === "tecnico_vicerrectorado") {
    estadosConvocatoria = [
      "Para Revisión",
      "En Revisión",
      "Observado",
      "Revisado",
      "Devuelto"
    ];
  } else if (role === "vicerrectorado") {
    estadosConvocatoria = [
      "Aprobado",
      "Devuelto"
    ];
  } else if (role === "personal_administrativo") {
    estadosConvocatoria = [
      "Aprobado"
    ];
  } else {
    estadosConvocatoria = [
      "Para Revisión",
      "En Revisión",
      "Observado",
      "Revisado",
      "Aprobado",
      "Devuelto"
    ];
  }

     return (
    <>
      <ListItem button onClick={() => setOpenEstadoMenu(!openEstadoMenu)}>
        <ListItemIcon>
          <ClipboardIcon sx={{ color: "#fff" }} />
        </ListItemIcon>
        {isExpanded && <ListItemText primary="Filtrar por Estado" />}
        {openEstadoMenu ? (
          <ExpandLess sx={{ color: "#fff" }} />
        ) : (
          <ExpandMore sx={{ color: "#fff" }} />
        )}
      </ListItem>

       <Collapse in={openEstadoMenu} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {estadosConvocatoria.map((estado) => (
            <ListItem
              key={estado}
              button
              component={Link}
              to={`/convocatorias/estado/${encodeURIComponent(estado)}`}
              sx={{
                pl: 4,
                backgroundColor: location.pathname === `/convocatorias/estado/${estado}` ? "#fff" : "transparent",
                color: location.pathname === `/convocatorias/estado/${estado}` ? "#000" : "#fff",
                "&:hover": {
                  backgroundColor: location.pathname === `/convocatorias/estado/${estado}` ? "#fff" : "rgba(255, 255, 255, 0.1)",
                }
              }}
            >
              <ListItemIcon sx={{ color: "inherit" }}>
                <ClipboardIcon fontSize="small" />
              </ListItemIcon>
              {isExpanded && <ListItemText primary={estado} />}
            </ListItem>
          ))}
        </List>
      </Collapse>
    </>
  );
};

  const renderMenuItems = () => {
    const estadosConvocatoria = [
      'Para Revisión',
      'En Revisión',
      'Observado',
      'Revisado',
      'Aprobado',
      'Devuelto'
    ];
    const commonItems = [
      role === "admin" && (
        <ListItem button component={Link} to="/usuarios" key="usuarios" sx={getItemStyle("/usuarios")}>
          <ListItemIcon sx={{ color: location.pathname === "/usuarios" ? "#000" : "#fff" }}>
            <PeopleIcon />
          </ListItemIcon>
          {isExpanded && <ListItemText primary="Usuarios" />}
        </ListItem>
      ),
      <ListItem button component={Link} to="/usuarios/me" key="perfil" sx={getItemStyle("/usuarios/me")}>
        <ListItemIcon sx={{ color: location.pathname === "/usuarios/me" ? "#000" : "#fff" }}>
          <PersonIcon />
        </ListItemIcon>
        {isExpanded && <ListItemText primary="Perfil" />}
      </ListItem>,
      <ListItem button component={Link} to="/notificaciones" key="notificaciones" sx={getItemStyle("/notificaciones")}>
        <ListItemIcon sx={{ color: location.pathname === "/notificaciones" ? "#000" : "#fff" }}>
          <NotificationsIcon />
        </ListItemIcon>
        {isExpanded && <ListItemText primary="Notificaciones" />}
      </ListItem>
    ];

    const roleSpecificItems = {
      admin: [
        <ListItem button component={Link} to="/facultades" key="facultades" sx={getItemStyle("/facultades")}>
          <ListItemIcon sx={{ color: location.pathname === "/facultades" ? "#000" : "#fff" }}>
            <HomeIcon />
          </ListItemIcon>
          {isExpanded && <ListItemText primary="Facultades" />}
        </ListItem>,
        <ListItem button component={Link} to="/carreras" key="carreras" sx={getItemStyle("/carreras")}>
          <ListItemIcon sx={{ color: location.pathname === "/carreras" ? "#000" : "#fff" }}>
            <BookIcon />
          </ListItemIcon>
          {isExpanded && <ListItemText primary="Carreras" />}
        </ListItem>,
        <ListItem button component={Link} to="/tipos-convocatorias" key="tipos-convocatorias" sx={getItemStyle("/tipos-convocatorias")}>
          <ListItemIcon sx={{ color: location.pathname === "/tipos-convocatorias" ? "#000" : "#fff" }}>
            <HomeIcon />
          </ListItemIcon>
          {isExpanded && <ListItemText primary="Tipos de convocatorias" />}
        </ListItem>,
        <ListItem button component={Link} to="/docentes" key="docentes" sx={getItemStyle("/docentes")}>
          <ListItemIcon sx={{ color: location.pathname === "/docentes" ? "#000" : "#fff" }}>
            <PersonIcon />
          </ListItemIcon>
          {isExpanded && <ListItemText primary="Docentes" />}
        </ListItem>,
        <ListItem button component={Link} to="/vicerrectores" key="vicerrectores" sx={getItemStyle("/vicerrectores")}>
          <ListItemIcon sx={{ color: location.pathname === "/vicerrectores" ? "#000" : "#fff" }}>
            <VerifiedIcon />
          </ListItemIcon>
          {isExpanded && <ListItemText primary="Vicerrectores" />}
        </ListItem>
      ],
      secretaria_de_decanatura: [
        <ListItem button component={Link} to="/convocatorias/crear" key="crear-convocatoria" sx={getItemStyle("/convocatorias/crear")}>
          <ListItemIcon sx={{ color: location.pathname === "/convocatorias/crear" ? "#000" : "#fff" }}>
            <CheckBoxIcon />
          </ListItemIcon>
          {isExpanded && <ListItemText primary="Crear Convocatoria" />}
        </ListItem>,        
        <ListItem button component={Link} to="/convocatorias" key="convocatorias" sx={getItemStyle("/convocatorias")}>
          <ListItemIcon sx={{ color: location.pathname.startsWith("/convocatorias") ? "#000" : "#fff" }}>
            <ClipboardIcon />
          </ListItemIcon>
          {isExpanded && <ListItemText primary="Convocatorias" />}
        </ListItem>,
       ...(isExpanded ? [renderEstadoFilter()] : [])
      ],

      tecnico_vicerrectorado: [
        <ListItem button component={Link} to="/convocatorias" key="convocatorias" sx={getItemStyle("/convocatorias")}>
          <ListItemIcon sx={{ color: location.pathname.startsWith("/convocatorias") ? "#000" : "#fff" }}>
            <ClipboardIcon />
          </ListItemIcon>
          {isExpanded && <ListItemText primary="Convocatorias" />}
        </ListItem>,
      ...(isExpanded ? [renderEstadoFilter()] : [])
      ],
      vicerrectorado: [
        <ListItem button component={Link} to="/convocatorias" key="convocatorias" sx={getItemStyle("/convocatorias")}>
          <ListItemIcon sx={{ color: location.pathname.startsWith("/convocatorias") ? "#000" : "#fff" }}>
            <VerifiedIcon />
          </ListItemIcon>
          {isExpanded && <ListItemText primary="Convocatorias Aprobadas" />}
        </ListItem>,...(isExpanded ? [renderEstadoFilter()] : [])
],
      personal_administrativo: [
        <ListItem button component={Link} to="/convocatorias" key="convocatorias" sx={getItemStyle("/convocatorias")}>
          <ListItemIcon sx={{ color: location.pathname.startsWith("/convocatorias") ? "#000" : "#fff" }}>
            <ClipboardIcon />
          </ListItemIcon>
          {isExpanded && <ListItemText primary="Convocatorias Aprobadas" />}
        </ListItem>
      ]
    };

    return [
      ...(roleSpecificItems[role] || []),
      ...commonItems.filter(Boolean),
      <Divider key="divider" />,
      <ListItem button onClick={handleLogout} key="logout" sx={getItemStyle("/logout")}>
        <ListItemIcon sx={{ color: "#fff" }}>
          <ExitToAppIcon />
        </ListItemIcon>
        {isExpanded && <ListItemText primary="Cerrar Sesión" />}
      </ListItem>
    ];
  };

  return (
    isLoggedIn && (
      <Drawer
        anchor="left"
        open={isMobile ? isDrawerOpen : true}
        onClose={toggleDrawer}
        variant={isMobile ? "temporary" : "permanent"}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: isExpanded ? drawerWidthExpanded : drawerWidthCollapsed,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: isExpanded ? drawerWidthExpanded : drawerWidthCollapsed,
            boxSizing: 'border-box',
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            color: "#fff",
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen
            })
          }
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between" p={2}>
          {isExpanded && (
            <Typography variant="h6" color="white">
              Gestión de Convocatorias
            </Typography>
          )}
          <Box display="flex" alignItems="center">
            {isMobile && (
              <IconButton onClick={toggleDrawer} sx={{ color: "white", mr: 1 }}>
                <MenuIcon />
              </IconButton>
            )}
            <NotificacionBadge />
            {!isMobile && (
              <IconButton onClick={toggleDrawerExpanded} sx={{ color: "white" }}>
                {isExpanded ? <ChevronLeftIcon /> : <ChevronRightIcon />}
              </IconButton>
            )}
          </Box>
        </Box>
        <Divider />
        <List>{renderMenuItems()}</List>
      </Drawer>
    )
  );
};

export default NavBar;
