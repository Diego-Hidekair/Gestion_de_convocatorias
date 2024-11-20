// backend/controllers/pdfController.js
const fs = require('fs');
const { Pool } = require('pg');
const pdf = require('html-pdf');
const { PDFDocument } = require('pdf-lib');
const multer = require('multer');

// Configuración de almacenamiento para multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Configuración de la base de datos
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Función auxiliar: Generar un PDF desde contenido HTML
const generarPDFBuffer = (htmlContent, options) => {
    return new Promise((resolve, reject) => {
        pdf.create(htmlContent, options).toBuffer((err, buffer) => {
            if (err) {
                console.error('Error al generar PDF:', err);
                reject(err);
            }
            resolve(buffer);
        });
    });
};

// Función auxiliar para combinar múltiples PDFs
const combinarPDFs = async (buffers) => {
    const pdfFinal = await PDFDocument.create();

    for (const buffer of buffers) {
        if (buffer) {
            const pdfDoc = await PDFDocument.load(buffer);
            const pages = await pdfFinal.copyPages(pdfDoc, pdfDoc.getPageIndices());
            pages.forEach((page) => pdfFinal.addPage(page));
        }
    }
    return pdfFinal.save();
};


// Generar un PDF base desde HTML
exports.generatePDF = async (req, res) => {
    const { id_convocatoria, id_honorario } = req.params;

    try {
        // Consulta de datos necesarios para el PDF
        const convocatoriaResult = await pool.query(
            `SELECT c.nombre, c.fecha_inicio, c.fecha_fin, tc.nombre_convocatoria, ca.nombre_carrera, f.nombre_facultad
             FROM convocatorias c
             JOIN tipos_convocatorias tc ON c.id_tipoconvocatoria = tc.id_tipoconvocatoria
             JOIN alm_programas ca ON c.id_programa = ca.id_programa
             JOIN alm_programas_facultades f ON ca.v_programas_facultades = f.id_facultad
             WHERE c.id_convocatoria = $1`,
            [id_convocatoria]
        ); 
        
        const convocatoria = convocatoriaResult.rows[0];
        if (!convocatoria) {
            return res.status(404).json({ error: "Convocatoria no encontrada" });
        }

        const honorariosResult = await pool.query(`
            SELECT h.pago_mensual, h.dictamen, h.resolucion, tc.nombre_convocatoria
            FROM honorarios h
            JOIN tipos_convocatorias tc ON h.id_tipoconvocatoria = tc.id_tipoconvocatoria
            WHERE h.id_convocatoria = $1 AND h.id_honorario = $2
        `, [id_convocatoria, id_honorario]);
        
        const honorarios = honorariosResult.rows[0];
        if (!honorarios) {
            return res.status(404).json({ error: 'Honorarios no encontrados.' });
        }

        if (convocatoria.nombre_convocatoria !== 'DOCENTES EN CALIDAD DE CONSULTORES DE LÍNEA') {
            return res.status(400).json({ error: "Tipo de convocatoria no aplicable para la generación de este PDF" });
        }

        // Ver o mostrar las materias a la convocatoria
        const materiasResult = await pool.query(`
            SELECT m.codigomateria, m.nombre AS materia, cm.total_horas, cm.perfil_profesional, cm.tiempo_trabajo
            FROM convocatorias_materias cm
            JOIN planes.pln_materias m ON cm.id_materia = m.id_materia
            WHERE cm.id_convocatoria = $1
        `, [id_convocatoria]);

        const materias = materiasResult.rows;
        console.log('Materias:', materias);
        const totalHoras = materias.reduce((sum, m) => sum + m.total_horas, 0);
        const tiempoTrabajo = materias.length > 0 ? materias[0].tiempo_trabajo : 'No definido';

        if (!honorarios) {
            return res.status(404).json({ error: "No se encontraron datos de honorarios para esta convocatoria y honorario." });
        }

        if (honorarios.nombre_convocatoria !== 'DOCENTES EN CALIDAD DE CONSULTORES DE LÍNEA') {
            console.log(`Error: Nombre de convocatoria no coincide. Esperado: 'DOCENTES EN CALIDAD DE CONSULTORES DE LÍNEA', Recibido: '${honorarios.nombre_convocatoria}'`);
            return res.status(400).json({ error: "Tipo de convocatoria no aplicable para la generación de este PDF" });
        }
        const pagoMensual = honorarios.pago_mensual;

        //generar contenido pdf
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
                    .notas { margin-top: 20px; }
                    strong { font-weight: bold; }
                    u { text-decoration: underline; }
                </style>
            </head>



            

            
            <body>
                <p>Señor:<br/>
                Rector de la Universidad Autónoma “Tomás Frías”</p>
                
                <p>Postulación a la <strong>${convocatoria.prioridad}</strong> Convocatoria a Concurso de<br/>
                Méritos para Provisión de...<br/>
                Docente para la Carrera de <strong>${convocatoria.nombre_carrera}</strong> en calidad de Consultor de Línea<br/>
                Gestión Académica <strong>${new Date().getMonth() < 6 ? 1 : 2}/2024</strong></p>
                
                <p>Ítem 1: <strong>${tiempoTrabajo}</strong></p>
                
                <p>Nombre del Postulante:<br/>
                Celular y/o teléfono:</p>

                <p>Presente</p>

                <p>El plazo para la presentación de postulación fenece a horas 12 (medio día) del día 
                <strong>${convocatoria.fecha_fin.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>, 
                procediéndose con la apertura de sobres a horas 14:30 en oficinas de la Dirección Administrativa y Financiera D.A.F., 
                las postulaciones presentadas fuera de plazo no serán tomadas en cuenta.</p>

                <p class="centrado">Potosí, <strong>${convocatoria.fecha_inicio.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></p>
                
                <div class="left-align">
                    <p><strong>M. Sc. Lic. Alberto Morales Colque</strong><br/>
                    Decano FF.CC.EE.FF.AA.</p>
                </div>

                <p class="centrado"><strong>Vº Bº</strong></p>

                <div class="right-aling">
                    <p><strong>M.Sc. Ing. David Soraide Lozano</strong><br/>
                    Vicerrector U.A.T.F.</p>
                </div>
            </body>    
        </html>
        `;
        /*************** */

    const options = {
        format: 'Letter',
        border: {
            top: '4cm',
            right: '2cm',
            bottom: '2cm',
            left: '2cm'
        }
    };

    async function combinarPDFs(documento_path, resolucion_path, dictamen_path, carta_path, nota, certificado_item, certificado_resumen_presupuestario ) {
        const pdfFinal = await PDFDocument.create();
    
        async function agregarPDF(buffer) {
            const pdfDoc = await PDFDocument.load(buffer);
            const [page] = await pdfFinal.copyPages(pdfDoc, [0]);
            pdfFinal.addPage(page);
        }
        if (documento_path) await agregarPDF(documento_path);
        if (resolucion_path) await agregarPDF(resolucion_path);
        if (dictamen_path) await agregarPDF(dictamen_path);
        if (carta_path) await agregarPDF(carta_path);
        if (nota) await agregarPDF(nota);
        if (certificado_item) await agregarPDF(certificado_item);
        if (certificado_resumen_presupuestario) await agregarPDF(certificado_resumen_presupuestario);

        return await pdfFinal.save();
    }

        /*************** */

        

    const pdfBuffer = await generarPDFBuffer(htmlContent, options);

// Obtener documentos existentes en la base de datos
const documento = await pool.query(`
    SELECT documento_path, resolucion_path, dictamen_path, carta_path, nota, certificado_item, certificado_resumen_presupuestario 
    FROM documentos WHERE id_convocatoria = $1
`, [id_convocatoria]);

let {
    documento_path, resolucion_path, dictamen_path, carta_path, nota, certificado_item, certificado_resumen_presupuestario
} = documento.rowCount > 0 ? documento.rows[0] : {};

documento_path = pdfBuffer;

nota = nota || null;
certificado_item = certificado_item || null;
certificado_resumen_presupuestario = certificado_resumen_presupuestario || null;

console.log('Paths obtenidos:', {
    documento_path, resolucion_path, dictamen_path, carta_path, nota, certificado_item, certificado_resumen_presupuestario
    });
        // Combina los PDFs usando la función auxiliar
        const pdfCombinado = await combinarPDFs( documento_path, resolucion_path, dictamen_path, carta_path, nota, certificado_item, certificado_resumen_presupuestario );
        // Guarda el PDF combinado en la base de datos
        if (documento.rowCount > 0) {
            await pool.query(
                `UPDATE documentos SET documento_path = $1 WHERE id_convocatoria = $2`,
                [pdfCombinado, id_convocatoria]
            );
        } else {
            await pool.query(
                `
                INSERT INTO documentos (id_convocatoria, documento_path) 
                VALUES ($1, $2) 
                ON CONFLICT (id_convocatoria) DO UPDATE 
                SET documento_path = EXCLUDED.documento_path
                `,
                [id_convocatoria, pdfBuffer]
            );
        }
        console.log('Actualizando base de datos con PDF combinado');

        res.status(200).json({ message: 'PDF combinado y actualizado correctamente.' });
    } catch (error) {
        console.error('Error generando el PDF:', error);
        res.status(500).json({ error: 'Error interno al generar el PDF' });
    }
};

// Función para combinar PDFs y actualizar documento_path en la base de datos
exports.combinePDFs = async (req, res) => {
    const { id_convocatoria } = req.params;

    try {
        const client = await pool.connect();

        // Obtener los documentos desde la base de datos
        const queryResult = await client.query(
            `SELECT documento_path, resolucion_path, dictamen_path, carta_path, nota, certificado_item, certificado_resumen_presupuestario FROM documentos WHERE id_convocatoria = $1`, [id_convocatoria] );
        
        if (queryResult.rows.length === 0) {
            return res.status(404).json({ error: 'Documento no encontrado.' });
        }

        let { documento_path, resolucion_path, dictamen_path, carta_path, nota, certificado_item, certificado_resumen_presupuestario} = queryResult.rows[0];

        // Validar que el documento principal esté disponible
        if (!documento_path) {
            return res.status(400).json({ error: 'El PDF base no se encuentra disponible en la base de datos.' });
        }

        // Añadir archivos subidos desde el frontend
        if (req.files && req.files.nota) {
            nota = req.files.nota[0].buffer;
        }
        if (req.files && req.files.certificado_item) {
            certificado_item = req.files.certificado_item[0].buffer;
        }
        if (req.files && req.files.certificado_resumen_presupuestario) {
            certificado_resumen_presupuestario = req.files.certificado_resumen_presupuestario[0].buffer;
        }
        
        if (req.files && req.files.resolucion) {
            resolucion_path = req.files.resolucion[0].buffer;
        }
        if (req.files && req.files.dictamen) {
            dictamen_path = req.files.dictamen[0].buffer;
        }
        if (req.files && req.files.carta) {
            carta_path = req.files.carta[0].buffer;
        }

        // Guardar en la base de datos
        await pool.query(`
            UPDATE documentos SET resolucion_path = $1, dictamen_path = $2, carta_path = $3, nota = $4, certificado_item = $5, certificado_resumen_presupuestario = $6 WHERE id_convocatoria = $7 `, [resolucion_path, dictamen_path, carta_path, nota, certificado_item, certificado_resumen_presupuestario, id_convocatoria]);

        console.log('PDFs a combinar:', { documento_path, resolucion_path, dictamen_path, carta_path, nota, certificado_item, certificado_resumen_presupuestario });

        const pdfCombinado = await combinarPDFs( documento_path, resolucion_path, dictamen_path, carta_path, nota, certificado_item, certificado_resumen_presupuestario );

        await client.query(`UPDATE documentos SET documento_path = $1 WHERE id_convocatoria = $2`, [pdfCombinado, id_convocatoria]);

        res.setHeader('Content-Type', 'application/pdf');
        res.end(pdfCombinado); // Cambiar de res.send a res.end

        client.release();
    } catch (error) {
        console.error('Error al combinar PDFs:', error);
        res.status(500).json({ error: 'Error al combinar PDFs.' });
    }
};

// Función para visualizar el PDF combinado
exports.viewCombinedPDF = async (req, res) => {
    const { id_convocatoria } = req.params;

    try {
        const pdfResult = await pool.query(`SELECT documento_path FROM documentos WHERE id_convocatoria = $1`, [id_convocatoria]);

        if (pdfResult.rows[0] && pdfResult.rows[0].documento_path) {
            res.setHeader('Content-Type', 'application/pdf');
            res.send(pdfResult.rows[0].documento_path);
        } else {
            res.status(404).json({ error: 'PDF no encontrado' });
        }
    } catch (error) {
        console.error('Error visualizando el PDF:', error);
        res.status(500).json({ error: 'Error visualizando el PDF' });
    }
};

exports.downloadCombinedPDF = async (req, res) => {
    const { id_convocatoria } = req.params;

    try {
        const pdfResult = await pool.query(`SELECT documento_path FROM documentos WHERE id_convocatoria = $1`, [id_convocatoria]);

        if (pdfResult.rows[0] && pdfResult.rows[0].documento_path) {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename="documento.pdf"'); // Esto fuerza la descarga
            res.send(pdfResult.rows[0].documento_path);
        } else {
            res.status(404).json({ error: 'PDF no encontrado' });
        }
    } catch (error) {
        console.error('Error descargando el PDF:', error);
        res.status(500).json({ error: 'Error descargando el PDF' });
    }
};