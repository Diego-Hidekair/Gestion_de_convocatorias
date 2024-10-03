// backend/app.js
require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const app = express();


// Importar el middleware de autenticación
const { authenticateToken } = require('./middleware/authMiddleware');

// Configuración de la base de datos
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

// Middlewares
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));


// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/pdfs', express.static(path.join(__dirname, 'pdfs')));

// Importar las rutas
const routes = [
    { path: '/facultades', route: './routes/facultadRoutes' },
    { path: '/carreras', route: './routes/carreraRoutes' },
    { path: '/tipo-convocatorias', route: './routes/tipoConvocatoriaRoutes' },
    { path: '/convocatorias', route: './routes/convocatoriaRoutes' },
    { path: '/materias', route: './routes/materiaRoutes' },
    { path: '/convocatoria-materias', route: './routes/convocatoriaMateriaRoutes' },
    { path: '/documentos', route: './routes/documentosRoutes' },
    { path: '/pdf', route: './routes/pdfRoutes' },
    { path: '/api/auth', route: './routes/authRoutes' },
    { path: '/usuarios', route: './routes/usuarioRoutes' },
    { path: '/honorarios', route: './routes/honorariosRoutes' }
];

// Usar las rutas
routes.forEach(r => app.use(r.path, require(r.route)));

// Middleware para rutas no encontradas
app.use((req, res, next) => {
    res.status(404).json({ error: "Ruta no encontrada" });
});

// Ruta de prueba para verificar la conexión
app.get('/', (req, res) => {
    res.send('API funcionando correctamente');
});

// Ruta protegida para obtener el perfil del usuario autenticado
app.get('/usuarios/me', authenticateToken, (req, res) => {
    res.json(req.user);
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

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
