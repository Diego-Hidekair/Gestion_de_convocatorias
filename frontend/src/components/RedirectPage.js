// frontend/src/components/RedirectPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Typography, Button, Stack } from '@mui/material';

const RedirectPage = () => {
    const navigate = useNavigate();

    const handleNavigation = (path) => {
        navigate(path);
    };

    return (
        <Container
            maxWidth="md"
            sx={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <Box
                sx={{
                    border: '5px solid #00639a',
                    borderRadius: '2rem',
                    padding: '16px 32px',
                    marginBottom: 4,
                }}
            >
                <Typography variant="h4" component="h1" sx={{ color: 'black', textAlign: 'center' }}>
                    Bienvenido a la Sección Inicial
                </Typography>
            </Box>

            <Stack direction="row" spacing={3}>
                <Button variant="contained" color="primary" size="large" onClick={() => handleNavigation('/convocatorias')}>
                    Ir a Convocatorias
                </Button>
                <Button variant="contained" color="primary" size="large" onClick={() => handleNavigation('/usuarios/me')}>
                    Ver Usuario
                </Button>
            </Stack>
        </Container>
    );
};

export default RedirectPage;