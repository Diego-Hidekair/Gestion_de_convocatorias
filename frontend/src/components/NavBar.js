// frontend/src/components/NavBar.js
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, Typography, IconButton, Box } from "@mui/material";
import { Menu as MenuIcon, Home as HomeIcon, Book as BookIcon, ContentPaste as ClipboardIcon, CheckBox as CheckBoxIcon, Person as PersonIcon, People as PeopleIcon, ExitToApp as ExitToAppIcon, ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from "@mui/icons-material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

const drawerWidthExpanded = 240;
const drawerWidthCollapsed = 70;

const NavBar = ({ onLogout }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [role, setRole] = useState("");
    const [isOpen, setIsOpen] = useState(false); // Para el drawer móvil
    const [isExpanded, setIsExpanded] = useState(true); // Para el drawer estático

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
        if (isMobile) {
            setIsOpen(false); // Cierra el drawer en móviles al cambiar de ruta
        }
    }, [location, isMobile]);

    const toggleDrawer = () => {
        setIsOpen((prev) => !prev);
    };

    const toggleDrawerExpanded = () => {
        setIsExpanded((prev) => !prev);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        if (onLogout) onLogout();
    };

    // Estilos dinámicos de los elementos del menú usando sx
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

    const renderMenuItems = () => {
        const commonItems = [
            role === "admin" && (
                <ListItem 
                    button={true}
                    component={Link} 
                    to="/usuarios" 
                    key="usuarios" 
                    sx={getItemStyle("/usuarios")}
                >
                    <ListItemIcon sx={{ color: "#fff" }}>
                        <PeopleIcon />
                    </ListItemIcon>
                    {(isExpanded || isMobile) && <ListItemText primary="Usuarios" />}
                </ListItem>
            ),
            <ListItem 
                button={true}
                component={Link} 
                to="/perfil" 
                key="perfil" 
                sx={getItemStyle("/perfil")}
            >
                <ListItemIcon sx={{ color: "#fff" }}>
                    <PersonIcon />
                </ListItemIcon>
                {(isExpanded || isMobile) && <ListItemText primary="Perfil de Usuario" />}
            </ListItem>,
        ];

        const roleSpecificItems = {
            admin: [
                <ListItem 
                    button={true}
                    component={Link} 
                    to="/facultades" 
                    key="facultades" 
                    sx={getItemStyle("/facultades")}
                >
                    <ListItemIcon sx={{ color: "#fff" }}>
                        <HomeIcon />
                    </ListItemIcon>
                    {(isExpanded || isMobile) && <ListItemText primary="Facultades" />}
                </ListItem>,
                <ListItem 
                    button={true}
                    component={Link} 
                    to="/carreras" 
                    key="carreras" 
                    sx={getItemStyle("/carreras")}
                >
                    <ListItemIcon sx={{ color: "#fff" }}>
                        <BookIcon />
                    </ListItemIcon>
                    {(isExpanded || isMobile) && <ListItemText primary="Carreras" />}
                </ListItem>,
                <ListItem 
                    button={true}
                    component={Link} 
                    to="/convocatorias" 
                    key="convocatorias" 
                    sx={getItemStyle("/convocatorias")}
                >
                    <ListItemIcon sx={{ color: "#fff" }}>
                        <ClipboardIcon />
                    </ListItemIcon>
                    {(isExpanded || isMobile) && <ListItemText primary="Convocatorias" />}
                </ListItem>,
            ],
            secretaria_de_decanatura: [
                <ListItem 
                    button={true}
                    component={Link} 
                    to="/convocatorias" 
                    key="convocatorias" 
                    sx={getItemStyle("/convocatorias")}
                >
                    <ListItemIcon sx={{ color: "#fff" }}>
                        <ClipboardIcon />
                    </ListItemIcon>
                    {(isExpanded || isMobile) && <ListItemText primary="Convocatorias" />}
                </ListItem>,
                <ListItem 
                    button={true}
                    component={Link} 
                    to="/convocatorias/crear" 
                    key="crear-convocatoria" 
                    sx={getItemStyle("/convocatorias/crear")}
                >
                    <ListItemIcon sx={{ color: "#fff" }}>
                        <CheckBoxIcon />
                    </ListItemIcon>
                    {(isExpanded || isMobile) && <ListItemText primary="Crear Convocatoria" />}
                </ListItem>,
            ],
            tecnico_vicerrectorado: [
                <ListItem 
                    button={true}
                    component={Link} 
                    to="/convocatorias" 
                    key="convocatorias" 
                    sx={getItemStyle("/convocatorias")}
                >
                    <ListItemIcon sx={{ color: "#fff" }}>
                        <ClipboardIcon />
                    </ListItemIcon>
                    {(isExpanded || isMobile) && <ListItemText primary="Convocatorias" />}
                </ListItem>,
            ],
        };

        return [
            ...(roleSpecificItems[role] || []),
            ...commonItems,
            <Divider key="divider" />,
            <ListItem 
                button={true}
                onClick={handleLogout} 
                key="logout" 
                sx={getItemStyle("/logout")}
            >
                <ListItemIcon sx={{ color: "#fff" }}>
                    <ExitToAppIcon />
                </ListItemIcon>
                {(isExpanded || isMobile) && <ListItemText primary="Cerrar Sesión" />}
            </ListItem>,
        ];
    };

    return (
        isLoggedIn && (
            <div>
                {isMobile && (
                    <IconButton
                        onClick={toggleDrawer}
                        sx={{
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
                    open={isMobile ? isOpen : true}
                    onClose={toggleDrawer}
                    variant={isMobile ? "temporary" : "permanent"}
                    sx={{
                        "& .MuiDrawer-paper": {
                            width: isExpanded ? drawerWidthExpanded : drawerWidthCollapsed,
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            color: "#fff",
                            transition: "width 0.3s ease",
                        },
                    }}
                >
                    <Box display="flex" alignItems="center" justifyContent={isExpanded ? "space-between" : "center"} padding="10px">
                        {isExpanded && (
                            <Typography variant="h6" color="white">
                                Gestión de Convocatorias
                            </Typography>
                        )}
                        <IconButton onClick={toggleDrawerExpanded} sx={{ color: "white" }}>
                            {isExpanded ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                        </IconButton>
                    </Box>
                    <Divider />
                    <List>{renderMenuItems()}</List>
                </Drawer>
            </div>
        )
    );
};

export default NavBar;