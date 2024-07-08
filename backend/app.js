// backend/app.js
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');

app.use(cors({
    origin: 'http://localhost:3000', // puerto origen donde se mandara
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(bodyParser.json());

// Importa las rutas 
const facultadRoutes = require('./routes/facultadRoutes');
const carreraRoutes = require('./routes/carreraRoutes');
const tipoConvocatoriaRoutes = require('./routes/tipoConvocatoriaRoutes');
const convocatoriaRoutes = require('./routes/convocatoriaRoutes');
const materiaRoutes = require('./routes/materiaRoutes'); 
const convocatoriaMateriaRoutes = require('./routes/convocatoriaMateriaRoutes');
const documentosRoutes = require('./routes/documentosRoutes');
const pdfRoutes = require('./routes/pdfRoutes');
const authRoutes = require('./routes/authRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');

// Usa las rutas 
app.use('/facultades', facultadRoutes);
app.use('/carreras', carreraRoutes);
app.use('/tipo-convocatorias', tipoConvocatoriaRoutes);
app.use('/convocatorias', convocatoriaRoutes);
app.use('/materias', materiaRoutes); 
app.use('/convocatoria-materias', convocatoriaMateriaRoutes);
app.use('/documentos', documentosRoutes);
app.use('/pdf', pdfRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);

// Ruta de prueba para verificar la conexión
app.get('/', (req, res) => {
    res.send('API funcionando correctamente');
});

// Manejo de rutas no encontradas
app.use((req, res, next) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejador de errores global
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Ha ocurrido un error interno en el servidor' });
});

// Cerrar sesión al finalizar el servidor
const shutdown = () => {
    console.log('Shutting down gracefully...');
    process.exit();
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});