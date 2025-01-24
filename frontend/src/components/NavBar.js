// frontend/src/components/NavBar.js
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, Typography, IconButton } from '@mui/material';
import { Menu as MenuIcon, Home as HomeIcon, Book as BookIcon, ContentPaste as ClipboardIcon, CheckBox as CheckBoxIcon, Person as PersonIcon, People as PeopleIcon, ExitToApp as ExitToAppIcon, } from '@mui/icons-material';
import useMediaQuery from '@mui/material/useMediaQuery';

const NavBar = ({ onLogout }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [role, setRole] = useState('');
    const location = useLocation();
    const isMobile = useMediaQuery('(max-width: 768px)');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsLoggedIn(true);
            const decodedToken = jwtDecode(token);
            setRole(decodedToken.rol);
        }
    }, []);

    useEffect(() => {
        setIsOpen(false);
    }, [location]);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        if (onLogout) onLogout();
    };

    const renderMenuItems = () => {
        const commonItems = [
            role === 'admin' && (
                <ListItem button component={Link} to="/usuarios" key="usuarios">
                    <ListItemIcon>
                        <PeopleIcon />
                    </ListItemIcon>
                    <ListItemText primary="Usuarios" />
                </ListItem>
            ),
            <ListItem button component={Link} to="/perfil" key="perfil">
                <ListItemIcon>
                    <PersonIcon />
                </ListItemIcon>
                <ListItemText primary="Perfil de Usuario" />
            </ListItem>,
        ];

        const roleSpecificItems = {
            admin: [
                <ListItem button component={Link} to="/facultades" key="facultades">
                    <ListItemIcon>
                        <HomeIcon />
                    </ListItemIcon>
                    <ListItemText primary="Facultades" />
                </ListItem>,
                <ListItem button component={Link} to="/carreras" key="carreras">
                    <ListItemIcon>
                        <BookIcon />
                    </ListItemIcon>
                    <ListItemText primary="Carreras" />
                </ListItem>,
            ],
            secretaria: [
                <ListItem button component={Link} to="/convocatorias" key="convocatorias">
                    <ListItemIcon>
                        <ClipboardIcon />
                    </ListItemIcon>
                    <ListItemText primary="Convocatorias" />
                </ListItem>,
                <ListItem button component={Link} to="/convocatorias/crear" key="crear-convocatoria">
                    <ListItemIcon>
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
            <ListItem button onClick={handleLogout} key="logout">
                <ListItemIcon>
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
                    {!isMobile && (
                        <Drawer
                            variant="permanent"
                            anchor="left"
                            open
                            sx={{
                                '& .MuiDrawer-paper': {
                                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                                    color: '#fff',
                                    width: 250,
                                },
                            }}
                        >
                            <div style={{ padding: 16 }}>
                                <Typography variant="h6">Gestión de Convocatorias</Typography>
                                <Divider />
                            </div>
                            <List>{renderMenuItems()}</List>
                        </Drawer>
                    )}

                    {isMobile && (
                        <>
                            <Drawer
                                anchor="left"
                                open={isOpen}
                                onClose={toggleSidebar}
                                sx={{
                                    '& .MuiDrawer-paper': {
                                        backgroundColor: 'rgba(0, 0, 0, 0.4)',
                                        color: '#fff',
                                        width: 250,
                                    },
                                }}
                            >
                                <div style={{ padding: 16 }}>
                                    <Typography variant="h6">Gestión de Convocatorias</Typography>
                                    <Divider />
                                </div>
                                <List>{renderMenuItems()}</List>
                            </Drawer>
                            <IconButton
                                onClick={toggleSidebar}
                                style={{ position: 'absolute', top: 16, left: 16 }}
                            >
                                <MenuIcon />
                            </IconButton>
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default NavBar;
