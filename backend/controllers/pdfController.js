// backend/controllers/pdfController.js
const fs = require('fs');
const { Pool } = require('pg');
const pdf = require('html-pdf');
const { PDFDocument } = require('pdf-lib');
const multer = require('multer');
z
// Configuración de almacenamiento para multer
const storage = multer.memoryStorage();
//const upload = multer({ storage });
const upload = multer({ storage: storage });
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
            <head>prueba de genrador de documento</head>
                {/*aqui hay contenido del pdf, pero lo saque para concentrarno en el codigo, este generador de pdf por html llama a casi a todos los datos de cada tabla que se menciona en el codigo*/}
        </html>
        `;

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
            `SELECT documento_path, resolucion_path, dictamen_path, carta_path, nota, certificado_item, certificado_resumen_presupuestario FROM documentos WHERE id_convocatoria = $1`, [id_convocatoria]
        );
        
        if (queryResult.rows.length === 0) {
            return res.status(404).json({ error: 'Documento no encontrado.' });
        }

        let { documento_path, resolucion_path, dictamen_path, carta_path, nota, certificado_item, certificado_resumen_presupuestario } = queryResult.rows[0];

        // Validar que el documento principal esté disponible
        if (!documento_path) {
            return res.status(400).json({ error: 'El PDF base no se encuentra disponible en la base de datos.' });
        }

        // Función para asegurar que los documentos sean Uint8Array
        const ensureUint8Array = (doc) => {
            if (Buffer.isBuffer(doc)) {
                return new Uint8Array(doc);  // Convierte a Uint8Array si es Buffer
            }
            return doc;  // Si ya es un Uint8Array, no hace nada
        };

        // Convertir todos los documentos a Uint8Array
        documento_path = ensureUint8Array(documento_path);
        resolucion_path = ensureUint8Array(resolucion_path);
        dictamen_path = ensureUint8Array(dictamen_path);
        carta_path = ensureUint8Array(carta_path);
        console.log('documento_path:', documento_path);
        console.log('resolucion_path:', resolucion_path);
        console.log('dictamen_path:', dictamen_path);
        console.log('carta_path:', carta_path);

        console.log('Archivos subidos:', req.files);
        console.log('Archivos recibidos:', req.files);

        // Verificación para asegurar que los documentos sean Uint8Array
        if (![documento_path, resolucion_path, dictamen_path, carta_path].every(doc => doc instanceof Uint8Array)) {
            return res.status(400).json({ error: 'Todos los documentos deben ser de tipo Uint8Array.' });
        }
        console.log('Tipo de documento_path:', documento_path instanceof Uint8Array);
        console.log('Tipo de resolucion_path:', resolucion_path instanceof Uint8Array);
        console.log('Tipo de dictamen_path:', dictamen_path instanceof Uint8Array);
        console.log('Tipo de carta_path:', carta_path instanceof Uint8Array);
        // Añadir archivos subidos desde el frontend, asegurándose de que sean válidos
        if (req.files) {
            if (req.files) {
                if (req.files.resolucion) {
                    resolucion_path = req.files.resolucion[0].buffer;
                }
                if (req.files.dictamen) {
                    dictamen_path = req.files.dictamen[0].buffer;
                }
                if (req.files.carta) {
                    carta_path = req.files.carta[0].buffer;
                }
            }
            if (req.files.nota) {
                nota = req.files.nota[0].buffer;
            }
            if (req.files.certificado_item) {
                certificado_item = req.files.certificado_item[0].buffer;
            }
            if (req.files.certificado_resumen_presupuestario) {
                certificado_resumen_presupuestario = req.files.certificado_resumen_presupuestario[0].buffer;
            }
            
        }

        // Guardar en la base de datos
        await pool.query(`
            UPDATE documentos SET resolucion_path = $1, dictamen_path = $2, carta_path = $3, nota = $4, certificado_item = $5, certificado_resumen_presupuestario = $6 WHERE id_convocatoria = $7
        `, [resolucion_path, dictamen_path, carta_path, nota, certificado_item, certificado_resumen_presupuestario, id_convocatoria]);

        // Crear el arreglo de archivos a combinar después de la validación
        const validateFile = (file) => {
            return file && file instanceof Uint8Array;
        };

        const filesToCombine = [
            documento_path, resolucion_path, dictamen_path, carta_path,
            nota, certificado_item, certificado_resumen_presupuestario
        ].filter(file => validateFile(file));

        // Comprobar si hay archivos válidos
        if (filesToCombine.length === 0) {
            return res.status(400).json({ error: 'No hay archivos válidos para combinar.' });
        }

        // Llamada a la función para combinar los PDFs
        const pdfCombinado = await combinarPDFs(...filesToCombine);

        // Actualizar el documento combinado en la base de datos
        await client.query(`UPDATE documentos SET documento_path = $1 WHERE id_convocatoria = $2`, [pdfCombinado, id_convocatoria]);

        // Responder con el PDF combinado
        res.setHeader('Content-Type', 'application/pdf');
        res.end(pdfCombinado);

        client.release();
    } catch (error) {
        console.error('Error al combinar PDFs:', error);
        return res.status(500).json({ 
            error: 'Error al combinar PDFs.',
            message: error.message,  // Esto puede ayudarte a obtener detalles sobre el error
            stack: error.stack       // Si es necesario, puedes incluir el stack trace
        });
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