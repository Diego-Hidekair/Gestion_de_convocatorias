// backend/app.js
require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const app = express();
const fileUpload = require('express-fileupload');

// Middleware de autenticación
const { authenticateToken } = require('./middleware/authMiddleware');

const pool = new Pool({
    user: process.env.DB_USER, 
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

pool.connect()
    .then(() => console.log('Conexión a la base de datos exitosa'))
    .catch(err => console.error('Error conectando a la base de datos', err));

app.use(cors({
    origin: 'http://localhost:3000',  
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],  
    allowedHeaders: ['Content-Type', 'Authorization']  
}));

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/pdfs', express.static(path.join(__dirname, 'pdfs')));
app.use(fileUpload());

// Rutas
const routes = [
    { path: '/facultades', route: './routes/facultadRoutes' },
    { path: '/carreras', route: './routes/carreraRoutes' },
    { path: '/tipos-convocatorias', route: './routes/tipoConvocatoriaRoutes' },
    { path: '/convocatorias', route: './routes/convocatoriaRoutes' },
    { path: '/materias', route: './routes/materiaRoutes' },
    { path: '/convocatoria-materias', route: './routes/convocatoriaMateriaRoutes' },
    { path: '/documentos', route: './routes/documentosRoutes' },
    { path: '/pdf', route: './routes/pdfRoutes' },
    { path: '/api/auth', route: './routes/authRoutes' }, // Montar las rutas de autenticación
    { path: '/honorarios', route: './routes/honorariosRoutes' },
    { path: '/usuarios', route: './routes/usuarioRoutes' },
    { path: '/convocatorias-documentos', route: './routes/convocatoriasDocumentosRoutes' },
    { path: '/convocatorias-archivos', route: './routes/convocatoriasArchivosRoutes' } 
];

// Montar las rutas
routes.forEach(r => app.use(r.path, require(path.join(__dirname, r.route))));

// Ruta de verificación
app.get('/', (req, res) => {
    res.send('API funcionando correctamente');
});

// Errores 404
app.use((req, res, next) => {
    res.status(404).json({ error: "Ruta no encontrada" });
});

// Errores globales
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Ha ocurrido un error interno en el servidor' });
});

const shutdown = () => {
    console.log('Cerrando el servidor de manera segura...');
    process.exit();
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
