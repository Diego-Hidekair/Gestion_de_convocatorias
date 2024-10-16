// backend/controllers/pdfController.js
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const pdf = require('html-pdf');
const multer = require('multer');
const { PDFDocument: PDFLibDocument } = require('pdf-lib');

// configurando el multer (almacenamientos)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// aqui se podra generar el Pdf utilizando HTML
exports.generatePDF = async (req, res) => {
    const { id_convocatoria, id_honorario } = req.params;
    
    console.log('ID Convocatoria:', id_convocatoria);
    console.log('ID Honorario:', id_honorario);

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
        console.log('Convocatoria:', convocatoria);

        if (!convocatoria) {
            return res.status(404).json({ error: "Convocatoria no encontrada" });
        }

        if (convocatoria.nombre_convocatoria !== 'DOCENTES EN CALIDAD DE CONSULTORES DE LÍNEA') {
            return res.status(400).json({ error: "Tipo de convocatoria no aplicable para la generación de este PDF" });
        }

         //AGREGAR materias a la  convocatoria
        const materiasResult = await pool.query(`
            SELECT m.codigomateria, m.nombre AS materia, cm.total_horas, cm.perfil_profesional, cm.tiempo_trabajo
            FROM convocatoria_materia cm
            JOIN materia m ON cm.id_materia = m.id_materia
            WHERE cm.id_convocatoria = $1
        `, [id_convocatoria]);

        const materias = materiasResult.rows;
        console.log('Materias:', materias);
        const totalHoras = materias.reduce((sum, m) => sum + m.total_horas, 0);
        const tiempoTrabajo = materias.length > 0 ? materias[0].tiempo_trabajo : 'No definido';


        // obteniendo los datos de la tabla honorarios
        const honorariosResult = await pool.query(`
            SELECT h.pago_mensual, h.dictamen, h.resolucion, tc.nombre_convocatoria
            FROM honorarios h
            JOIN tipo_convocatoria tc ON h.id_tipoconvocatoria = tc.id_tipoconvocatoria
            WHERE h.id_convocatoria = $1 AND h.id_honorario = $2
        `, [id_convocatoria, id_honorario]);

        
        const honorarios = honorariosResult.rows[0];
        console.log('Honorarios:', honorarios);

        if (!honorarios) {
            return res.status(404).json({ error: "No se encontraron datos de honorarios para esta convocatoria y honorario." });
        }

        if (honorarios.nombre_convocatoria !== 'DOCENTES EN CALIDAD DE CONSULTORES DE LÍNEA') {
            console.log(`Error: Nombre de convocatoria no coincide. Esperado: 'DOCENTES EN CALIDAD DE CONSULTORES DE LÍNEA', Recibido: '${honorarios.nombre_convocatoria}'`);
            return res.status(400).json({ error: "Tipo de convocatoria no aplicable para la generación de este PDF" });
        }
        
        
        // HTML para el contenido del PDF
        
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
                <h1>${convocatoria.nombre}</h1>
                <h2>${convocatoria.nombre_convocatoria}</h2>
                <p>
                    Por determinación del Consejo de Carrera de <strong>${convocatoria.nombre_carrera}</strong>, 
                    mediante Dictamen N° <strong>${honorarios.dictamen}</strong>; homologado por Resolución del Consejo Facultativo N° 
                    <strong>${honorarios.resolucion}</strong> de la Facultad de <strong>${convocatoria.nombre_facultad}</strong>, se convoca a los profesionales en 
                    ${convocatoria.nombre_carrera} al <strong>CONCURSO DE MÉRITOS</strong> para optar por la docencia universitaria, 
                    como Docente Consultor de Línea a <strong>${tiempoTrabajo}</strong> para la gestión académica 
                    ${new Date().getMonth() < 5 ? 1 : 2}/2024.
                </p>
                <h3>Tiempo de trabajo: ${tiempoTrabajo}</h3>
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
                <h3>Total Horas: ${totalHoras}</h3>
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
                <p><strong>2.) REQUISITOS MÍNIMOS HABILITANTES INDISPENSABLES:</strong></p>
                <p><strong>a)</strong> Carta de postulación <strong>(dirigida al señor Rector)</strong>, especificando
                el ítem y las asignaturas a la que postula.</p>
                <p><strong>b)</strong> Currículum vitae debidamente documentado, adjuntando fotocopias simples 
                (incisos c.1 y c.6 del Art. 77 del Reglamento del Régimen Académico Docente de la Universidad Boliviana).
                La Universidad se reservará el derecho de solicitar la presentación de los documentos originales en cualquier 
                momento del proceso de contratación y de manera obligatoria la presentación para la firma de contrato. </p>
                <p><strong>c)</strong> Fotocopia legalizada del Diploma Académico por Secretaría General de la 
                Universidad que confirió dicho documento, el cual debe ser otorgado por una de
                las universidades del Sistema de la Universidad Boliviana (Art. 77 inc. c.2 Reglamento del Régimen Académico Docente 
                de la Universidad Boliviana)<strong>ACTUALIZADA.</strong>  </p>
                <p><strong>d)</strong> Fotocopia legalizada del Título en Provisión Nacional por Secretaría General
                de la Universidad que confirió dicho documento, el cual debe ser otorgado por una de 
                las universidades del Sistema de la Universidad Boliviana (Art. 77 inc. c.2 
                Reglamento del Régimen Académico Docente de la Universidad Boliviana) <strong>ACTUALIZADA</strong>.</p>
                <p><strong>e)</strong> Fotocopia de la Cédula de Identidad, con verificación de datos por Secretaría 
                General de la Universidad Autónoma “Tomás Frías”<strong>ACTUALIZADA.</strong> </p>
                <p><strong>f)</strong> Fotocopia del Título de Maestría o Doctorado y/o Certificado de Diplomado en Educación Superior como mínimo, dictado o reconocido por una de las 
                Universidades del Sistema de la Universidad Boliviana. (art. 71 inc. e y art. 77 inc. c.4 del Reglamento del Régimen Académico Docente de la Universidad Boliviana), 
                legalizado por la Universidad que confirió dicho documento <strong>ACTUALIZADA.</strong> </p>
                <p><strong>g)</strong>  Acreditar experiencia profesional no menor a dos años, computable a partir de la 
                obtención del Título en Provisión Nacional. (Art. 71 inc. c y art. 77 inc. c.3 del
                Reglamento del Régimen Académico Docente de la Universidad Boliviana)   </p>
                <p><strong>h)</strong>   Certificación actualizada de no tener procesos Universitarios otorgado por la 
                Secretaria General de la Universidad Autónoma “Tomás Frías”. </p>
                <p><strong>i)</strong> Certificación actualizada de no tener antecedentes anti autonomistas, en nuestra 
                Universidad, otorgado por la Secretaria General de la Universidad Autónoma “Tomás Frías”. </p>
                <p><strong>j)</strong>  Plan de trabajo correspondiente a las materias que postula con un enfoque basado en competencias en la modalidad presencial, semipresencial de acuerdo a las 
                características de las asignaturas de la Carrera, este plan debe ser factible para los 
                recursos con que cuenta la Universidad Autónoma “Tomás Frías” (art. 77 inc. c.8 del 
                Reglamento del Régimen Académico Docente de la Universidad Boliviana). </p>
                <p><strong>k)</strong> Certificación actualizada de no tener cuentas pendientes con la Carrera o Universidad Autónoma “Tomás Frías” (cursos de Postgrado y otras obligaciones pendientes de pago o rendición de cuentas). Expedido por la Dirección 
                Administrativa Financiera. </p>
                <p><strong>l)</strong> Declaración jurada, actualizada, ante Notario de Fe Pública que especifique los siguientes extremos:</p>

                <p>            1. No estar comprendido en: las incompatibilidades establecidas por el
                            Reglamento de Incompatibilidades aprobado por el Honorable Consejo
                            Universitario (Resolución N° 86-2007 del HCU).</p>
                            <p>
                            2. No estar comprendido dentro de las limitaciones establecidas en el artículo
                            12 del Decreto Supremo 4848 (remuneración máxima en el sector público)
                            y artículo 24 (doble percepción) del Decreto Supremo 4848. </p>
                <p><strong>m)</strong> m) Certificación de manejo de entornos virtuales para la enseñanza virtual acorde al área de conocimiento que postula.  </p>
                <p><strong>3.) OTROS REQUISITOS: </strong></p>

                <p><strong>a)</strong> Producción intelectual (libros, ensayos, folletos, artículos de revistas y otros) que será valorado en el proceso de calificación</p>
                <p><u>La no presentación de uno de los requisitos MÍNIMOS HABILITANTES, dará lugar a la inhabilitación
                de su postulación.</u></p>
                <p>El profesional que resulte ganador tiene la obligación de presentar de manera obligatoria para la firma de contrato, la siguiente documentación:</p>
                <p>1) Certificado CENVI emitido por el Consejo de la Magistratura.</p>
                <p>2) Certificado actualizado de no tener antecedentes penales (REJAP) emitido por el Consejo de la
                Magistratura.</p>
                Se deja claramente establecido que la documentación presentada no será devuelta.

                <p><strong>4.) HONORARIOS: </strong></p>
                <p>La consultoría será cancelada con recursos institucionales y/o propios, a partir de fecha fijada en
                Contrato con el siguiente detalle:</p>
                <table>
                    <tr>
                        <th>Docente Consultor de Línea</th>
                        <th>Pago Mensual (Bs.)</th>
                    </tr>
                    <tr>
                        <td>Docente Consultor de Línea (${tiempoTrabajo})</td>
                        <td>${pagoMensual}</td>
                    </tr>
                </table>
                <p>Los honorarios del Consultor serán cancelados en forma mensual, previa presentación de 
                los requisitos exigidos por la División de Tesoro dependiente de la Dirección 
                Administrativa y Financiera</p>
                <p>El Pago de los impuestos de ley es responsabilidad exclusiva del consultor, debiendo 
                presentar factura o una fotocopia de su declaración jurada trimestral en Impuestos 
                Nacionales, caso contrario se realizará la retención correspondiente a los impuestos de 
                ley. El consultor será responsable de realizar los pagos de los aportes establecidos en la 
                ley 065 de Pensiones y su Reglamentación.</p>
                <p><strong>5.) POSTULACIONES: </strong></p>
                <p>Las postulaciones deberán ser presentadas en Secretaria de 
                Rectorado, Edificio Administrativo, 4to. Piso de la Universidad Autónoma “Tomás Frías” 
                ubicada en Av. Cívica esquina Serrudo, en sobre cerrado dirigido al señor Rector, 
                adjuntando los requisitos exigidos debidamente foliados, con el siguiente rótulo:</p>
            </body>

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

        // Opciones de formato del PDF
        const options = {
            format: 'Letter',
            border: {
                top: '4cm',
                right: '2cm',
                bottom: '2cm',
                left: '2cm'
            }
        };

        const pdfBuffer = await pdf.create(htmlContent, options).toBuffer();

        await pool.query(`
            UPDATE documentos SET 
                documento_path = $1,
                resolucion_path = $2, 
                dictamen_path = $3, 
                carta_path = $4 
            WHERE id_convocatoria = $5
        `, [
            pdfBuffer,
            req.files['resolucion_path'] ? req.files['resolucion_path'][0].buffer : null,
            req.files['dictamen_path'] ? req.files['dictamen_path'][0].buffer : null,
            req.files['carta_path'] ? req.files['carta_path'][0].buffer : null,
            id_convocatoria
        ]);
        res.status(200).json({ message: 'PDF generado y almacenado en la base de datos con éxito' });
    } catch (error) {
        console.error('Error generando el PDF:', error);
        res.status(500).json({ error: 'Error generando el PDF' });
    }
};
  /*      
        console.log('Combined PDF Buffer:', combinedPDFBuffer);
console.log('Archivos Subidos:', {
    resolucion_path: req.files['resolucion_path'],
    dictamen_path: req.files['dictamen_path'],
    carta_path: req.files['carta_path']
});*/

        /*const pdfPath = path.join(__dirname, '..', 'pdfs', `convocatoria_${id_convocatoria}.pdf`);
        pdf.create(htmlContent, options).toFile(pdfPath, async (err, resPdf) => {
            if (err) return res.status(500).json({ error: 'Error generando el PDF' });

            // Actualiza la base de datos con la ruta del PDF generado
            await pool.query(`
                UPDATE documentos SET documento_path = $1 WHERE id_convocatoria = $2
            `, [`pdfs/convocatoria_${id_convocatoria}.pdf`, id_convocatoria]);

            res.status(200).json({ message: 'PDF generado y guardado con éxito', pdfPath });
        });*/

// combinar pdfs
exports.combinePDFs = [
    upload.fields([{ name: 'resolucion_path' }, { name: 'dictamen_path' }, { name: 'carta_path' }]),
    async (req, res) => {
        const { id_convocatoria } = req.params;

        try {
            const pdfBufferResult = await pool.query(`
                SELECT documento_path FROM documentos WHERE id_convocatoria = $1
            `, [id_convocatoria]);

            const basePDFDoc = await PDFLibDocument.load(pdfBufferResult.rows[0].documento_path);

            if (req.files['resolucion_path']) {
                const resolucionBuffer = req.files['resolucion_path'][0].buffer;
                const resolucionDoc = await PDFLibDocument.load(resolucionBuffer);
                const pages = await basePDFDoc.copyPages(resolucionDoc, resolucionDoc.getPageIndices());
                pages.forEach(page => basePDFDoc.addPage(page));
            }

            if (req.files['dictamen_path']) {
                const dictamenBuffer = req.files['dictamen_path'][0].buffer;
                const dictamenDoc = await PDFLibDocument.load(dictamenBuffer);
                const pages = await basePDFDoc.copyPages(dictamenDoc, dictamenDoc.getPageIndices());
                pages.forEach(page => basePDFDoc.addPage(page));
            }

            if (req.files['carta_path']) {
                const cartaBuffer = req.files['carta_path'][0].buffer;
                const cartaDoc = await PDFLibDocument.load(cartaBuffer);
                const pages = await basePDFDoc.copyPages(cartaDoc, cartaDoc.getPageIndices());
                pages.forEach(page => basePDFDoc.addPage(page));
            }

            const combinedPDFBuffer = await basePDFDoc.save();

            await pool.query(`
                UPDATE documentos SET documento_path = $1 WHERE id_convocatoria = $2
            `, [combinedPDFBuffer, id_convocatoria]);

            res.status(200).json({ message: 'PDF combinado y guardado con éxito en la base de datos' });
        } catch (error) {
            console.error('Error combinando los PDFs:', error);
            res.status(500).json({ error: 'Error combinando los PDFs' });
        }
    }
];

// para poder ver el pdf combinado
exports.viewCombinedPDF = async (req, res) => {
    const { id_convocatoria } = req.params;

    try {
        const pdfResult = await pool.query(`
            SELECT documento_path FROM documentos WHERE id_convocatoria = $1
        `, [id_convocatoria]);
        
        if (pdfResult.rows[0].documento_path) {
            res.setHeader('Content-Type', 'application/pdf');
            res.send(pdfResult.rows[0].documento_path); // Enviar el contenido BYTEA
        } else {
            res.status(404).json({ error: 'PDF no encontrado' });
        }
        
    } catch (error) {
        console.error('Error visualizando el PDF:', error);
        res.status(500).json({ error: 'Error visualizando el PDF' });
    }
};

