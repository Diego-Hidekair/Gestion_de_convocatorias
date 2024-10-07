// backend/controllers/pdfController.js
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const pdf = require('html-pdf'); // Usar html-pdf para renderizado con HTML
const multer = require('multer');

// Configuración de multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'pdfs'));
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}_${Date.now()}_${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

// Consulta el pago mensual de la tabla honorarios
const honorariosResult = await pool.query(`
    SELECT pago_mensual 
    FROM honorarios 
    WHERE id_convocatoria = $1
`, [id_convocatoria]);

const pagoMensual = honorariosResult.rows[0] ? honorariosResult.rows[0].pago_mensual : 'No definido';

// Configuración de la base de datos
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Función para generar el PDF usando HTML
exports.generatePDF = async (req, res) => {
    const { id_convocatoria, id_honorario } = req.params;

    try {
        // Obtener los datos de la convocatoria
        const convocatoriaResult = await pool.query(`
            SELECT c.nombre, c.fecha_inicio, c.fecha_fin, tc.nombre_convocatoria, ca.nombre_carrera, f.nombre_facultad
            FROM convocatorias c
            JOIN tipo_convocatoria tc ON c.id_tipoconvocatoria = tc.id_tipoconvocatoria
            JOIN carrera ca ON c.id_carrera = ca.id_carrera
            JOIN facultad f ON c.id_facultad = f.id_facultad
            WHERE c.id_convocatoria = $1
        `, [id_convocatoria]);

        const convocatoria = convocatoriaResult.rows[0];
        if (!convocatoria) {
            return res.status(404).json({ error: "Convocatoria no encontrada" });
        }

        // Obtener las materias asociadas a la convocatoria
        const materiasResult = await pool.query(`
            SELECT m.codigomateria, m.nombre AS materia, cm.total_horas, cm.perfil_profesional, cm.tiempo_trabajo
            FROM convocatoria_materia cm
            JOIN materia m ON cm.id_materia = m.id_materia
            WHERE cm.id_convocatoria = $1
        `, [id_convocatoria]);

        const materias = materiasResult.rows;

        // Calcular total de horas
        const totalHoras = materias.reduce((sum, m) => sum + m.total_horas, 0);

        // Calcular el tiempo de trabajo
        const tiempoTrabajo = totalHoras < 24 ? 'TIEMPO HORARIO' : 'TIEMPO COMPLETO';


        // HTML para el contenido del PDF
        const htmlContent = `
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; }
                    h1, h2 { text-align: center; }
                    p { text-align: justify; }
                    .materia { margin-top: 10px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { text-align: center; border: 1px solid black; padding: 8px; }
                    th { background-color: #f2f2f2; }
                    .notas { margin-top: 20px; }
                </style>
            </head>
            <body>
                <h1>${convocatoria.nombre}</h1>
                <h2>${convocatoria.nombre_convocatoria}</h2>
                <p>
                    Por determinación del Consejo de Carrera de ${convocatoria.nombre_carrera}, 
                    mediante Dictamen N° 046; homologado por Resolución del Consejo Facultativo N° 295 
                    de la Facultad de ${convocatoria.nombre_facultad}, se convoca a los profesionales en 
                    ${convocatoria.nombre_carrera} al <strong>CONCURSO DE MÉRITOS</strong> para optar por la docencia universitaria, 
                    como Docente Consultor de Línea a ${tiempoTrabajo} para la gestión académica ${new Date().getMonth() < 5 ? 1 : 2}/2024.
                </p>
                
                <h3>Tiempo de trabajo: ${tiempoTrabajo}</h3> <!-- Mostrar el tiempo de trabajo aquí -->

                <h2>MATERIAS OBJETO DE LA CONVOCATORIA:</h2>
                <p><strong>1) MATERIAS OBJETO DE LA CONVOCATORIA:</strong></p>
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
                        ${materias.map((m, index) => `
                            <tr>
                                <td>${m.codigomateria}</td>
                                <td>${m.materia}</td>
                                <td>${m.total_horas}</td>
                                ${index === 0 ? `<td rowspan="${materias.length}">${m.perfil_profesional}</td>` : ''}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <h3>Total Horas: ${totalHoras}</h3> <!-- Mostrar el total de horas aquí -->

                <p class="notas">
                    Podrán participar todos los profesionales con Título en Provisión Nacional otorgado por
                    la Universidad Boliviana que cumplan los requisitos mínimos habilitantes de acuerdo al
                    XII Congreso Nacional de Universidades.
                </p>
                <p class="notas">
                    Nota.- Se deja claramente establecido que NO podrán participar Profesionales que
                           presten sus servicios en otras instituciones públicas (incisos a) y d) de la Ley 856 y 
                           profesionales que trabajen en instituciones privadas a Tiempo Completo.
                </p>
            </body>
            </html>
        `;

        // Configuración de opciones de html-pdf
        const options = { format: 'Letter' };

        // Crear el PDF a partir del HTML
        pdf.create(htmlContent, options).toFile(path.join(__dirname, '..', 'pdfs', `convocatoria_${id_convocatoria}.pdf`), async (err, resPdf) => {
            if (err) return console.log(err);

            const pdfPath = resPdf.filename;

            // Actualizar la base de datos con la ruta del PDF generado
            await pool.query('UPDATE documentos SET documento_path = $1 WHERE id_convocatoria = $2', [pdfPath, id_convocatoria]);

            // Enviar respuesta al cliente
            res.status(200).json({ message: 'PDF generado con éxito', pdfPath });
        });

    } catch (error) {
        console.error('Error generando el PDF:', error);
        res.status(500).json({ error: 'Error generando el PDF' });
    }
};

// Cambia la función de combinar PDFs para aceptar archivos
exports.combinePDFs = [
    upload.fields([{ name: 'resolucion_path' }, { name: 'dictamen_path' }, { name: 'carta_path' }]),
    async (req, res) => {
        const { id_convocatoria } = req.params;

        try {
            const basePDFPath = path.join(__dirname, '..', 'pdfs', `convocatoria_${id_convocatoria}.pdf`);
            if (!fs.existsSync(basePDFPath)) {
                return res.status(404).json({ error: 'PDF base no encontrado' });
            }

            const basePDFBytes = fs.readFileSync(basePDFPath);
            const basePDFDoc = await PDFLibDocument.load(basePDFBytes);

            // Verifica y carga los PDFs adicionales
            if (req.files['resolucion_path']) {
                const resolucionBytes = fs.readFileSync(req.files['resolucion_path'][0].path);
                const resolucionDoc = await PDFLibDocument.load(resolucionBytes);
                const pages = await basePDFDoc.copyPages(resolucionDoc, resolucionDoc.getPageIndices());
                pages.forEach(page => basePDFDoc.addPage(page));
            }

            if (req.files['dictamen_path']) {
                const dictamenBytes = fs.readFileSync(req.files['dictamen_path'][0].path);
                const dictamenDoc = await PDFLibDocument.load(dictamenBytes);
                const pages = await basePDFDoc.copyPages(dictamenDoc, dictamenDoc.getPageIndices());
                pages.forEach(page => basePDFDoc.addPage(page));
            }

            if (req.files['carta_path']) {
                const cartaBytes = fs.readFileSync(req.files['carta_path'][0].path);
                const cartaDoc = await PDFLibDocument.load(cartaBytes);
                const pages = await basePDFDoc.copyPages(cartaDoc, cartaDoc.getPageIndices());
                pages.forEach(page => basePDFDoc.addPage(page));
            }

            const combinedPDFPath = path.join(__dirname, '..', 'pdfs', `convocatoria_${id_convocatoria}_combinado.pdf`);
            const combinedPDFBytes = await basePDFDoc.save();
            fs.writeFileSync(combinedPDFPath, combinedPDFBytes);

            await pool.query('UPDATE documentos SET resolucion_path = $1, dictamen_path = $2, carta_path = $3 WHERE id_convocatoria = $4', 
                [req.files['resolucion_path'] ? req.files['resolucion_path'][0].path : null,
                 req.files['dictamen_path'] ? req.files['dictamen_path'][0].path : null,
                 req.files['carta_path'] ? req.files['carta_path'][0].path : null,
                 id_convocatoria]);

            res.status(200).json({ message: 'PDF combinado con éxito', combinedPDFPath });
        } catch (error) {
            console.error('Error combinando los PDFs:', error);
            res.status(500).json({ error: 'Error combinando los PDFs' });
        }
    }
];

// función para ver el PDF combinado
exports.viewCombinedPDF = (req, res) => {
    const { id_convocatoria } = req.params;
    const combinedPDFPath = path.join(__dirname, '..', 'pdfs', `convocatoria_${id_convocatoria}_combinado.pdf`);

    if (fs.existsSync(combinedPDFPath)) {
        res.sendFile(combinedPDFPath);
    } else {
        res.status(404).json({ error: 'PDF combinado no encontrado' });
    }
};
