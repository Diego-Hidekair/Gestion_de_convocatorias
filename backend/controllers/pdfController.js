    // backend/controllers/pdfController.js
    const { Pool } = require('pg');
    const pdf = require('html-pdf');
    const { PDFDocument } = require('pdf-lib');
    const path = require('path');
    const fs = require('fs');

    const pool = new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
    });

    const generarPDFBuffer = (htmlContent, options) => {//generar el pdf desde un html
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

    const combinarPDFs = async (pdfBuffers) => { //para poder combinar pdfs
        const mergedPdf = await PDFDocument.create();
        for (const pdfBuffer of pdfBuffers) {
            const pdf = await PDFDocument.load(pdfBuffer);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach((page) => mergedPdf.addPage(page));
        }
        return await mergedPdf.save();
    };

    const guardarDocumentoPDF = async (id_convocatoria, pdfBuffer) => {//para guardar o actualizar el documento en la DB
        const documentoExistente = await pool.query(
            `SELECT id_documentos FROM documentos WHERE id_convocatoria = $1`,
            [id_convocatoria]
        );

        if (documentoExistente.rowCount > 0) {
            console.log(`Actualizando documento existente para id_convocatoria: ${id_convocatoria}`);
            await pool.query(
                `UPDATE documentos SET documento_path = $1, fecha_generacion = CURRENT_TIMESTAMP WHERE id_convocatoria = $2`,
                [pdfBuffer, id_convocatoria]
            );
        } else {
            console.log(`Insertando nuevo documento para id_convocatoria: ${id_convocatoria}`);
            const result = await pool.query(
                `INSERT INTO documentos (documento_path, id_convocatoria) VALUES ($1, $2) RETURNING id_documentos`,
                [pdfBuffer, id_convocatoria]
            );
            return result.rows[0].id_documentos;
        }
    };

    const guardarConvocatoriaArchivo = async (id_convocatoria, pdfBuffer, id_documentos) => {
        const convocatoriaArchivoExistente = await pool.query(
            `SELECT id_conv_combinado FROM convocatorias_archivos WHERE id_convocatoria = $1`,
            [id_convocatoria]
        );
    
        if (convocatoriaArchivoExistente.rowCount > 0) {
            console.log(`Actualizando convocatoria_archivo existente para id_convocatoria: ${id_convocatoria}`);
            await pool.query(
                `UPDATE convocatorias_archivos SET convocatoria = $1 WHERE id_convocatoria = $2`,
                [pdfBuffer, id_convocatoria]
            );
        } else {
            console.log(`Insertando nuevo convocatoria_archivo para id_convocatoria: ${id_convocatoria}`);
            await pool.query(
                `INSERT INTO convocatorias_archivos (convocatoria, id_convocatoria, id_documentos) VALUES ($1, $2, $3)`,
                [pdfBuffer, id_convocatoria, id_documentos]
            );
        }
    };

    exports.generatePDF = async (req, res) => {
        const { id_convocatoria, id_honorario } = req.params;

        try {
            console.log(`Generando PDF para id_convocatoria: ${id_convocatoria}, id_honorario: ${id_honorario}`);
            const convocatoriaResult = await pool.query( //para sacar los datos de las convocatorias
                `SELECT c.nombre, c.fecha_inicio, c.fecha_fin, tc.nombre_convocatoria, 
                        ca.nombre_carrera, f.nombre_facultad
                FROM convocatorias c
                JOIN tipos_convocatorias tc ON c.id_tipoconvocatoria = tc.id_tipoconvocatoria
                JOIN alm_programas ca ON c.id_programa = ca.id_programa
                JOIN alm_programas_facultades f ON ca.v_programas_facultades = f.id_facultad
                WHERE c.id_convocatoria = $1`,
                [id_convocatoria]
            );
            console.log('Convocatoria:', convocatoriaResult.rows[0]);

            const convocatoria = convocatoriaResult.rows[0];
            if (!convocatoria) {
                return res.status(404).json({ error: "Convocatoria no encontrada" });
            }
            const honorariosResult = await pool.query(//para sacar los datos de los honroarios
                `SELECT h.pago_mensual, h.dictamen, h.resolucion, tc.nombre_convocatoria
                FROM honorarios h
                JOIN tipos_convocatorias tc ON h.id_tipoconvocatoria = tc.id_tipoconvocatoria
                WHERE h.id_convocatoria = $1 AND h.id_honorario = $2`,
                [id_convocatoria, id_honorario]
            );
            console.log('Honorarios:', honorariosResult.rows[0]);

            const honorarios = honorariosResult.rows[0];
            if (!honorarios) {
                console.error('Error: Honorarios no encontrados para id_convocatoria:', id_convocatoria, 'id_honorario:', id_honorario);
                return res.status(404).json({ error: "Honorarios no encontrados" });
            }

            //pra sacar los datos de materia asociadas a la convocatoria
            const materiasResult = await pool.query(`
                SELECT m.codigomateria, m.nombre AS materia, cm.total_horas, cm.perfil_profesional, cm.tiempo_trabajo
                FROM convocatorias_materias cm
                JOIN planes.pln_materias m ON cm.id_materia = m.id_materia
                WHERE cm.id_convocatoria = $1
            `, [id_convocatoria]);
            console.log('Materias asociadas:', materiasResult.rows);

            const materias = materiasResult.rows;
            const totalHoras = materias.reduce((sum, m) => sum + m.total_horas, 0);
            const tiempoTrabajo = materias.length > 0 ? materias[0].tiempo_trabajo : 'No definido';

            //desde aqui se empueza a generar el codgio html para generar el pdf segun el tipo de convcoatoria
            let htmlContent;
            switch (convocatoria.nombre_convocatoria) { 
                case 'DOCENTES EN CALIDAD DE CONSULTORES DE LÍNEA':
                    htmlContent = generateConsultoresLineaHTML(convocatoria, honorarios, materias, totalHoras, tiempoTrabajo);
                    break;
                case 'DOCENTE EN CALIDAD ORDINARIO':
                    htmlContent = generateOrdinarioHTML(convocatoria, honorarios, materias, totalHoras, tiempoTrabajo);
                    break;
                case 'DOCENTE EN CALIDAD EXTRAORDINARIO':
                    htmlContent = generateExtraordinarioHTML(convocatoria, honorarios, materias, totalHoras, tiempoTrabajo);
                    break;
                default:
                    return res.status(400).json({ error: `Tipo de convocatoria no aplicable: ${convocatoria.nombre_convocatoria}` });
            }

            const options = { format: 'Letter', border: { top: '3cm', right: '2cm', bottom: '2cm', left: '2cm' } };
            const pdfBuffer = await generarPDFBuffer(htmlContent, options);
            const id_documentos = await guardarDocumentoPDF(id_convocatoria, pdfBuffer);
            console.log(`PDF generado, tamaño: ${pdfBuffer.length} bytes`);

            await guardarDocumentoPDF(id_convocatoria, pdfBuffer);
            await guardarConvocatoriaArchivo(id_convocatoria, pdfBuffer, id_documentos);

            res.status(201).json({ message: "PDF generado y almacenado correctamente." });
        } catch (error) {
            console.error('Error al generar PDF:', error);
            res.status(500).json({ error: "Error al generar el PDF." });
        }
    };

    function generateConsultoresLineaHTML(convocatoria, honorarios, materias, totalHoras, tiempoTrabajo) {
        return `
        html>
            <head>
                <style>
                    body { 
                        font-family: 'Times New Roman', Times, serif; line-height: 1.5; margin: 4cm 2cm 2cm 2cm; 
                    }
                    h1 { 
                        font-size: 24pt; 
                        font-weight: bold; 
                        text-align: center; 
                        text-transform: uppercase; 
                        margin-bottom: 20px; 
                    }
                    h2 { 
                        font-size: 18pt; 
                        font-weight: bold; 
                        text-align: center; 
                        text-transform: uppercase; 
                        margin-bottom: 20px; 
                    }
                    h3 { 
                        font-size: 14pt; 
                        font-weight: bold; 
                        text-align: left; 
                        margin-bottom: 10px; 
                    }
                    p { 
                        font-size: 12pt; 
                        text-align: justify; 
                        margin-bottom: 10px; 
                    }
                    .centrado { 
                        text-align: center; 
                    }
                    .left-align { 
                        text-align: left; 
                    }
                    table { 
                        width: 100%; 
                        border-collapse: collapse; 
                        margin-top: 20px; 
                        margin-bottom: 20px; 
                    }
                    th, td { 
                        text-align: center; 
                        border: 1px solid black; 
                        padding: 8px; 
                    }
                    th { 
                        background-color: #f2f2f2; 
                    }
                    .notas { 
                        margin-top: 20px; 
                    }
                    strong { 
                        font-weight: bold; 
                    }
                    u { 
                        text-decoration: underline; 
                    }
                </style>
            </head>
            <body>
                <h1>${convocatoria.nombre}</h1>
                <h2>${convocatoria.nombre_convocatoria}</h2>
                <p>
                    Por determinación del Consejo de Carrera de <strong>${convocatoria.nombre_carrera}</strong>, 
                    mediante Dictamen N° <strong>${honorarios.dictamen}</strong>; homologado por Resolución del Consejo Facultativo N° 
                    <strong>    </strong> de la Facultad de <strong>${convocatoria.nombre_facultad}</strong>, se convoca a los profesionales en 
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
                        <td>${honorarios.pago_mensual}</td>
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
    }

    function generateOrdinarioHTML(convocatoria, honorarios, materias, totalHoras, tiempoTrabajo) {
        return `
        <html>
            <head>
                nose que poner </head>
                    <body>
                    aqui deberia ir el cuerpo
            </body>    
        </html>
        `;
    }

    function generateExtraordinarioHTML(convocatoria, honorarios, materias, totalHoras, tiempoTrabajo) {
        return `
        <html>
            <head>
                nose que poner </head>
                    <body>
                    aqui deberia ir el cuerpo
            </body>    
        </html>
        `;
    }
     


    exports.combinarYGuardarPDFs = async (req, res) => {//combinado y guardado con los documentos que se suben 
        const { id_convocatoria } = req.params;
        const { archivos } = req.body; 

        try {
            const documentoInicial = await pool.query(
                `SELECT documento_path FROM documentos WHERE id_convocatoria = $1`,
                [id_convocatoria]
            );
            if (documentoInicial.rows.length === 0) {
                return res.status(404).json({ error: "Documento inicial no encontrado." });
            }
            const pdfInicial = documentoInicial.rows[0].documento_path;  //pdf generado
            const archivosParaCombinar = [pdfInicial, ...archivos];         // Combinar PDFs
            const pdfCombinado = await combinarPDFs(archivosParaCombinar); //pdf combinado
            await guardarDocumentoPDF(id_convocatoria, pdfCombinado);
            res.status(201).json({ message: "PDFs combinados y almacenados correctamente." });
        } catch (error) {
            console.error('Error al combinar y guardar PDFs:', error);
            res.status(500).json({ error: "Error al combinar y guardar los PDFs." });
        }
    };

    exports.viewCombinedPDF = async (req, res) => {
        const { id_convocatoria } = req.params;

        try {
            const result = await pool.query(
                'SELECT documento_path FROM documentos WHERE id_convocatoria = $1',
                [id_convocatoria]
            );

            if (result.rows.length === 0 || !result.rows[0].documento_path) {
                return res.status(404).send('Documento combinado no encontrado.');
            }

            const pdfBuffer = result.rows[0].documento_path;
            res.setHeader('Content-Type', 'application/pdf');
            res.send(pdfBuffer);
        } catch (error) {
            console.error('Error al recuperar el PDF combinado:', error);
            res.status(500).send('Error al recuperar el PDF combinado.');
        }
    };

    exports.downloadCombinedPDF = async (req, res) => {
        const { id_convocatoria } = req.params;

        try {
            const pdfResult = await pool.query(
                `SELECT documento_path FROM documentos WHERE id_convocatoria = $1`,
                [id_convocatoria]
            );

            if (pdfResult.rows[0] && pdfResult.rows[0].documento_path) {
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', 'attachment; filename="documento.pdf"');
                res.send(pdfResult.rows[0].documento_path);
            } else {
                res.status(404).json({ error: 'PDF no encontrado' });
            }
        } catch (error) {
            console.error('Error descargando el PDF:', error);
            res.status(500).json({ error: 'Error descargando el PDF' });
        }
    };

    exports.deletePDF = async (req, res) => {
        const { id_convocatoria } = req.params;

        try {
            const result = await pool.query(
                `DELETE FROM documentos WHERE id_convocatoria = $1 RETURNING *`,
                [id_convocatoria]
            );

            if (result.rowCount > 0) {
                res.status(200).json({ message: "PDF eliminado correctamente." });
            } else {
                res.status(404).json({ error: "PDF no encontrado." });
            }
        } catch (error) {
            console.error('Error al eliminar el PDF:', error);
            res.status(500).json({ error: "Error al eliminar el PDF." });
        }
    };
