// frontend/src/components/NavBar.js
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, Typography, IconButton, Box, Button } from "@mui/material";
import { Menu as MenuIcon, Home as HomeIcon, Book as BookIcon, ContentPaste as ClipboardIcon, CheckBox as CheckBoxIcon, Person as PersonIcon, People as PeopleIcon, ExitToApp as ExitToAppIcon, ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon, Verified as VerifiedIcon } from "@mui/icons-material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

const drawerWidthExpanded = 240;
const drawerWidthCollapsed = 70;

const NavBar = ({ onLogout }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [role, setRole] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);

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
            setIsOpen(false);
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
                    button
                    component={Link} 
                    to="/usuarios" 
                    key="usuarios" 
                    sx={getItemStyle("/usuarios")}
                >
                    <ListItemIcon sx={{ color: location.pathname === "/usuarios" ? "#000" : "#fff" }}>
                        <PeopleIcon />
                    </ListItemIcon>
                    {(isExpanded || isMobile) && <ListItemText primary="Usuarios" />}
                </ListItem>
            ),
            <ListItem 
                button
                component={Link} 
                to="/usuarios/me" 
                key="perfil" 
                sx={getItemStyle("/usuarios/me")}
            >
                <ListItemIcon sx={{ color: location.pathname === "/usuarios/me" ? "#000" : "#fff" }}>
                    <PersonIcon />
                </ListItemIcon>
                {(isExpanded || isMobile) && <ListItemText primary="Perfil" />}
            </ListItem>
        ];

        const roleSpecificItems = {
            admin: [
                <ListItem 
                    button
                    component={Link} 
                    to="/facultades" 
                    key="facultades" 
                    sx={getItemStyle("/facultades")}
                >
                    <ListItemIcon sx={{ color: location.pathname === "/facultades" ? "#000" : "#fff" }}>
                        <HomeIcon />
                    </ListItemIcon>
                    {(isExpanded || isMobile) && <ListItemText primary="Facultades" />}
                </ListItem>,
                <ListItem 
                    button
                    component={Link} 
                    to="/carreras" 
                    key="carreras" 
                    sx={getItemStyle("/carreras")}
                >
                    <ListItemIcon sx={{ color: location.pathname === "/carreras" ? "#000" : "#fff" }}>
                        <BookIcon />
                    </ListItemIcon>
                    {(isExpanded || isMobile) && <ListItemText primary="Carreras" />}
                </ListItem>,
                <ListItem 
                    button
                    component={Link} 
                    to="/convocatorias" 
                    key="convocatorias" 
                    sx={getItemStyle("/convocatorias")}
                >
                    <ListItemIcon sx={{ color: location.pathname === "/convocatorias" ? "#000" : "#fff" }}>
                        <ClipboardIcon />
                    </ListItemIcon>
                    {(isExpanded || isMobile) && <ListItemText primary="Convocatorias" />}
                </ListItem>,
            ],
            secretaria_de_decanatura: [
                <ListItem 
                    button
                    component={Link} 
                    to="/convocatorias" 
                    key="convocatorias" 
                    sx={getItemStyle("/convocatorias")}
                >
                    <ListItemIcon sx={{ color: location.pathname === "/convocatorias" ? "#000" : "#fff" }}>
                        <ClipboardIcon />
                    </ListItemIcon>
                    {(isExpanded || isMobile) && <ListItemText primary="Convocatorias" />}
                </ListItem>,
                <ListItem 
                    button
                    component={Link} 
                    to="/convocatorias/crear" 
                    key="crear-convocatoria" 
                    sx={getItemStyle("/convocatorias/crear")}
                >
                    <ListItemIcon sx={{ color: location.pathname === "/convocatorias/crear" ? "#000" : "#fff" }}>
                        <CheckBoxIcon />
                    </ListItemIcon>
                    {(isExpanded || isMobile) && <ListItemText primary="Crear Convocatoria" />}
                </ListItem>,
            ],
            tecnico_vicerrectorado: [
                <ListItem 
                    button
                    component={Link} 
                    to="/convocatorias" 
                    key="convocatorias" 
                    sx={getItemStyle("/convocatorias")}
                >
                    <ListItemIcon sx={{ color: location.pathname === "/convocatorias" ? "#000" : "#fff" }}>
                        <ClipboardIcon />
                    </ListItemIcon>
                    {(isExpanded || isMobile) && <ListItemText primary="Convocatorias" />}
                </ListItem>,
            ],
            vicerrectorado: [
                <ListItem 
                    button
                    component={Link} 
                    to="/convocatorias-aprobadas" 
                    key="convocatorias-aprobadas" 
                    sx={getItemStyle("/convocatorias-aprobadas")}
                >
                    <ListItemIcon sx={{ color: location.pathname === "/convocatorias-aprobadas" ? "#000" : "#fff" }}>
                        <VerifiedIcon />
                    </ListItemIcon>
                    {(isExpanded || isMobile) && <ListItemText primary="Convocatorias Aprobadas" />}
                </ListItem>,
            ]
        };

        return [
            ...(roleSpecificItems[role] || []),
            ...commonItems.filter(Boolean),
            <Divider key="divider" />,
            <ListItem 
                button
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