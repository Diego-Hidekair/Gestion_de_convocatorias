// backend/controllers/pdfDocenteExtraordinario.js
// backend/controllers/pdfController.js
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const pdf = require('html-pdf');
const multer = require('multer');
const { PDFDocument: PDFLibDocument } = require('pdf-lib');

// Configuración de almacenamiento para multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Función para generar un buffer PDF a partir de HTML
const generarPDFBuffer = (htmlContent, options) => {
    return new Promise((resolve, reject) => {
        pdf.create(htmlContent, options).toBuffer((err, buffer) => {
            if (err) {
                console.error('Error en la generación del PDF:', err);
                return reject(err);
            }
            resolve(buffer);
        });
    });
};

exports.generatePDFOrdinario = async (req, res) => {
    const { id_convocatoria, id_honorario } = req.params;

    try {
        // Consulta para obtener datos de convocatoria
        const convocatoriaResult = await pool.query(`
            SELECT c.nombre, c.fecha_inicio, c.fecha_fin, tc.nombre_convocatoria, ca.Nombre_carrera, f.Nombre_facultad
            FROM convocatorias c
            JOIN tipos_convocatorias tc ON c.id_tipoconvocatoria = tc.id_tipoconvocatoria
            JOIN alm_programas ca ON c.id_programa = ca.id_programa
            JOIN alm_programas_facultades f ON ca.v_programas_facultades = f.id_facultad
            WHERE c.id_convocatoria = $1
        `, [id_convocatoria]);

        const convocatoria = convocatoriaResult.rows[0];

        // Verificación del tipo de convocatoria
        if (!convocatoria || convocatoria.nombre_convocatoria !== 'DOCENTE EN CALIDAD EXTRAORDINARIO') {
            return res.status(400).json({ error: "Tipo de convocatoria no aplicable para este PDF" });
        }

        // Consulta para obtener datos de honorarios
        const honorariosResult = await pool.query(`
            SELECT h.pago_mensual, h.dictamen, h.resolucion
            FROM honorarios h
            WHERE h.id_convocatoria = $1 AND h.id_honorario = $2
        `, [id_convocatoria, id_honorario]);

        const honorarios = honorariosResult.rows[0];

        // Consulta para obtener las materias
        const materiasResult = await pool.query(`
            SELECT m.codigomateria, m.nombre AS materia, cm.total_horas, cm.perfil_profesional, cm.tiempo_trabajo
            FROM convocatorias_materias cm
            JOIN planes.pln_materias m ON cm.id_materia = m.id_materia
            WHERE cm.id_convocatoria = $1
        `, [id_convocatoria]);

        const materias = materiasResult.rows;
        const totalHoras = materias.reduce((sum, m) => sum + m.total_horas, 0);
        const tiempoTrabajo = materias.length > 0 ? materias[0].tiempo_trabajo : 'No definido';

        // Creación del contenido HTML
        const htmlContent = `
            <html>
            <head>
                <style>
                    body { font-family: 'Times New Roman', Times, serif; line-height: 1.5; margin: 4cm 2cm 2cm 2cm; }
                    h1, h2 { text-align: center; text-transform: uppercase; }
                    p { text-align: justify; }
                    .centrado { text-align: center; }
                    .left-align { text-align: left; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { text-align: center; border: 1px solid black; padding: 8px; }
                    th { background-color: #f2f2f2; }
                </style>
            </head>
            <body>
                <h1>${convocatoria.nombre}</h1>
                <h2>${convocatoria.nombre_convocatoria}</h2>
                <p>
                    Se convoca a los profesionales de <strong>${convocatoria.Nombre_carrera}</strong> al concurso para el cargo de Docente Ordinario. 
                    Fecha de inicio: <strong>${convocatoria.fecha_inicio.toLocaleDateString()}</strong>, hasta 
                    <strong>${convocatoria.fecha_fin.toLocaleDateString()}</strong>.
                </p>
                <h3>Tiempo de trabajo: ${tiempoTrabajo}</h3>
                <h2>MATERIAS OBJETO DE LA CONVOCATORIA:</h2>
                <table>
                    <thead>
                        <tr>
                            <th>SIGLA</th>
                            <th>MATERIA</th>
                            <th>HORAS</th>
                            <th>PERFIL REQUERIDO</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${materias.map(m => `
                            <tr>
                                <td>${m.codigomateria}</td>
                                <td>${m.materia}</td>
                                <td>${m.total_horas}</td>
                                <td>${m.perfil_profesional}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <h3>Total Horas: ${totalHoras}</h3>
                <p>Los requisitos incluyen:</p>
                <ul>
                    <li>Certificación actualizada de antecedentes</li>
                    <li>Título en Provisión Nacional</li>
                    <li>Experiencia profesional</li>
                    <!-- Más requisitos según la normativa específica -->
                </ul>
            </body>
            </html>
        `;

        const options = { format: 'Letter', border: { top: '4cm', right: '2cm', bottom: '2cm', left: '2cm' } };
        const pdfBuffer = await generarPDFBuffer(htmlContent, options);

        // Almacenar el PDF en la base de datos
        const documentoExistente = await pool.query(`SELECT 1 FROM documentos WHERE id_convocatoria = $1`, [id_convocatoria]);

        if (documentoExistente.rowCount > 0) {
            await pool.query(`
                UPDATE documentos SET documento_path = $1 WHERE id_convocatoria = $2
            `, [pdfBuffer, id_convocatoria]);
        } else {
            await pool.query(`
                INSERT INTO documentos (id_convocatoria, documento_path) VALUES ($1, $2)
            `, [id_convocatoria, pdfBuffer]);
        }

        res.status(200).json({ message: 'PDF generado y almacenado exitosamente' });
    } catch (error) {
        console.error('Error generando el PDF:', error);
        res.status(500).json({ error: 'Error generando el PDF' });
    }
};
