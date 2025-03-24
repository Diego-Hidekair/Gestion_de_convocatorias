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
                <ListItem button component={Link} to="/usuarios" key="usuarios" style={getItemStyle("/usuarios")}>
                    <ListItemIcon style={{ color: "#fff" }}>
                        <PeopleIcon />
                    </ListItemIcon>
                    {(isExpanded || isMobile) && <ListItemText primary="Usuarios" />}
                </ListItem>
            ),
            <ListItem button component={Link} to="/perfil" key="perfil" style={getItemStyle("/perfil")}>
                <ListItemIcon style={{ color: "#fff" }}>
                    <PersonIcon />
                </ListItemIcon>
                {(isExpanded || isMobile) && <ListItemText primary="Perfil de Usuario" />}
            </ListItem>,
        ];

        const roleSpecificItems = {
            admin: [
                <ListItem button component={Link} to="/facultades" key="facultades" style={getItemStyle("/facultades")}>
                    <ListItemIcon style={{ color: "#fff" }}>
                        <HomeIcon />
                    </ListItemIcon>
                    {(isExpanded || isMobile) && <ListItemText primary="Facultades" />}
                </ListItem>,
                <ListItem button component={Link} to="/carreras" key="carreras" style={getItemStyle("/carreras")}>
                    <ListItemIcon style={{ color: "#fff" }}>
                        <BookIcon />
                    </ListItemIcon>
                    {(isExpanded || isMobile) && <ListItemText primary="Carreras" />}
                </ListItem>,
                <ListItem button component={Link} to="/convocatorias" key="convocatorias" style={getItemStyle("/convocatorias")}>
                    <ListItemIcon style={{ color: "#fff" }}>
                        <ClipboardIcon />
                    </ListItemIcon>
                    {(isExpanded || isMobile) && <ListItemText primary="Convocatorias" />}
                </ListItem>,
            ],
            secretaria: [
                <ListItem button component={Link} to="/convocatorias" key="convocatorias" style={getItemStyle("/convocatorias")}>
                    <ListItemIcon style={{ color: "#fff" }}>
                        <ClipboardIcon />
                    </ListItemIcon>
                    {(isExpanded || isMobile) && <ListItemText primary="Convocatorias" />}
                </ListItem>,
                <ListItem button component={Link} to="/convocatorias/crear" key="crear-convocatoria" style={getItemStyle("/convocatorias/crear")}>
                    <ListItemIcon style={{ color: "#fff" }}>
                        <CheckBoxIcon />
                    </ListItemIcon>
                    {(isExpanded || isMobile) && <ListItemText primary="Crear Convocatoria" />}
                </ListItem>,
            ],
            vicerrectorado: [
                <ListItem button component={Link} to="/convocatorias" key="convocatorias" style={getItemStyle("/convocatorias")}>
                    <ListItemIcon style={{ color: "#fff" }}>
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
            <ListItem button onClick={handleLogout} key="logout" style={getItemStyle("/logout")}>
                <ListItemIcon style={{ color: "#fff" }}>
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
                    open={isMobile ? isOpen : true} // El drawer se abre solo en móvil
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