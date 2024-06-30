// app.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(bodyParser.json());

const facultadRoutes = require('./routes/facultadRoutes');
const carreraRoutes = require('./routes/carreraRoutes');
const tipoConvocatoriaRoutes = require('./routes/tipoConvocatoriaRoutes');
const convocatoriaRoutes = require('./routes/convocatoriaRoutes');
const materiaRoutes = require('./routes/materiaRoutes'); 
const convocatoriaMateriaRoutes = require('./routes/convocatoriaMateriaRoutes'); 
const documentosRoutes = require('./routes/documentosRoutes'); 
const pdfRoutes = require('./routes/pdfRoutes'); 
const authRoutes = require('./routes/authRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes'); // Añadido

app.use('/facultades', facultadRoutes);
app.use('/carreras', carreraRoutes);
app.use('/tipos-convocatorias', tipoConvocatoriaRoutes);
app.use('/tipoConvocatoria', tipoConvocatoriaRoutes);
app.use('/convocatorias', convocatoriaRoutes);
app.use('/materias', materiaRoutes);
app.use('/convocatorias/materias', convocatoriaMateriaRoutes); 
app.use('/documentos', documentosRoutes); 
app.use('/pdf', pdfRoutes); 
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes); // Añadido

// Handle 404 - Route not found
app.use((req, res, next) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Ha ocurrido un error interno en el servidor' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
