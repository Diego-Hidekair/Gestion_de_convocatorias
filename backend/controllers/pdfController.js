// backend/controllers/pdfController.js
const fs = require('fs');
const { Pool } = require('pg');
const pdf = require('html-pdf');
const path = require('path');

const pool = new Pool({//DB
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


exports.generatePDF = async (req, res) => {
    const { id_convocatoria, id_honorario } = req.params;

    try {
        console.log(`Generando PDF para id_convocatoria: ${id_convocatoria}, id_honorario: ${id_honorario}`);
        const convocatoriaResult = await pool.query(
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
        if (!convocatoria) return res.status(404).json({ error: "Convocatoria no encontrada" });


        const honorariosResult = await pool.query(
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
        

        if (convocatoria.nombre_convocatoria !== 'DOCENTES EN CALIDAD DE CONSULTORES DE LÍNEA') {
            return res.status(400).json({ error: "Tipo de convocatoria no aplicable para la generación de este PDF" });
        }

        const materiasResult = await pool.query(`
            SELECT m.codigomateria, m.nombre AS materia, cm.total_horas, cm.perfil_profesional, cm.tiempo_trabajo
            FROM convocatorias_materias cm
            JOIN planes.pln_materias m ON cm.id_materia = m.id_materia
            WHERE cm.id_convocatoria = $1
        `, [id_convocatoria]);
        console.log('Materias asociadas:', materiasResult.rows);

        const materias = materiasResult.rows;
        console.log('Materias:', materias);
        const totalHoras = materias.reduce((sum, m) => sum + m.total_horas, 0);
        const tiempoTrabajo = materias.length > 0 ? materias[0].tiempo_trabajo : 'No definido';

        if (honorarios.nombre_convocatoria !== 'DOCENTES EN CALIDAD DE CONSULTORES DE LÍNEA') {
            console.log(`Error: Nombre de convocatoria no coincide. Esperado: 'DOCENTES EN CALIDAD DE CONSULTORES DE LÍNEA', Recibido: '${honorarios.nombre_convocatoria}'`);
            return res.status(400).json({ error: "Tipo de convocatoria no aplicable para la generación de este PDF" });
        }
        const pagoMensual = honorarios.pago_mensual;

        //generar contenido pdf
        const htmlContent = `
        <html>
            {/*aqui existe codigo para crear el pdf, pero por ahora no lo lleno para evitar sobre pasar el limite de caracteres por pregunta en el sistema*/}
        </html>
        `;
        
    const options = { format: 'Letter', border: { top: '3cm', right: '2cm', bottom: '2cm', left: '2cm' } };

    const pdfBuffer = await generarPDFBuffer(htmlContent, options);//espacio de almacenamiento temporal (buffer)

    console.log(`PDF generado, tamaño: ${pdfBuffer.length} bytes`);
    
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
            await pool.query(
                `INSERT INTO documentos (documento_path, id_convocatoria) VALUES ($1, $2)`,
                [pdfBuffer, id_convocatoria]
            );
        }

        res.status(201).json({ message: "PDF generado y almacenado correctamente." });
    } catch (error) {
        console.error('Error al generar PDF:', error);
        res.status(500).json({ error: "Error al generar el PDF." });
    }
};


    /*let { documento_path} = documento.rowCount > 0 ? documento.rows[0] : {};

    documento_path = pdfBuffer;
    res.status(201).json({ message: "PDF generado y almacenado correctamente." });
    } catch (error) {
        console.error('Error al generar PDF:', error);
        res.status(500).json({ error: "Error al generar el PDF." });
    }
};*/

exports.viewCombinedPDF = async (req, res) => {
    const { id_convocatoria } = req.params;

    try {
        console.log(`Obteniendo documento combinado para id_convocatoria: ${id_convocatoria}`);
        
        const result = await pool.query(
            'SELECT documento_path FROM documentos WHERE id_convocatoria = $1',
            [id_convocatoria]
        );

        if (result.rows.length === 0 || !result.rows[0].documento_path) {
            console.warn(`Documento no encontrado para id_convocatoria: ${id_convocatoria}`);
            return res.status(404).send('Documento combinado no encontrado.');
        }

        const pdfBuffer = result.rows[0].documento_path;
        console.log(`Documento combinado encontrado para id_convocatoria: ${id_convocatoria}, tamaño: ${pdfBuffer.length} bytes`);

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