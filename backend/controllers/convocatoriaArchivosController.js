//backend/controllers/convocatoriaArchivosController.js
const pool = require('../db');
const fs = require('fs');
const path = require('path');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const { authenticateToken } = require('../middleware/authMiddleware');
//const pdfBytes = await pdfDoc.save();
//const pdfBase64 = pdfBytes.toString('base64');


// Directorio para guardar los PDFs generados
const PDF_DIR = path.join(__dirname, '..', 'pdfs');
if (!fs.existsSync(PDF_DIR)) {
    fs.mkdirSync(PDF_DIR, { recursive: true });
}

const generateConvocatoriaPDF = async (req, res) => {
    const { id } = req.params;
    
    try {
        const convocatoria = await pool.query(` 
            SELECT c.*, tc.nombre_tipo_conv, p.programa, f.facultad, 
                   u.nombres || ' ' || u.apellido_paterno AS creador,
                   v.nombre_vicerector
            FROM convocatorias c
            JOIN tipos_convocatorias tc ON c.id_tipoconvocatoria = tc.id_tipoconvocatoria
            JOIN datos_universidad.alm_programas p ON c.id_programa = p.id_programa
            JOIN datos_universidad.alm_programas_facultades f ON p.id_facultad = f.id_facultad
            JOIN usuarios u ON c.id_usuario = u.id_usuario
            JOIN vicerrector v ON c.id_vicerector = v.id_vicerector
            WHERE c.id_convocatoria = $1
        `, [id]);

        if (convocatoria.rows.length === 0) {
            return res.status(404).json({ error: 'Convocatoria no encontrada' });
        }
        const conv = convocatoria.rows[0];
        const materias = await pool.query(`
            SELECT cm.*, m.materia, m.cod_materia, m.horas_teoria, m.horas_practica
            FROM convocatorias_materias cm
            JOIN datos_universidad.pln_materias m ON cm.id_materia = m.id_materia
            WHERE cm.id_convocatoria = $1
        `, [id]);
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([600, 800]);
        const { width, height } = page.getSize();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        page.drawText('UNIVERSIDAD AUTÓNOMA TOMÁS FRÍAS', {
            x: 50,
            y: height - 50,
            size: 16,
            font: fontBold,
            color: rgb(0, 0, 0),
        });
        
        page.drawText('VICERRECTORADO', {
            x: 50,
            y: height - 80,
            size: 14,
            font: fontBold,
            color: rgb(0, 0, 0),
        });
        
        page.drawText(`CONVOCATORIA: ${conv.nombre_conv}`, {
            x: 50,
            y: height - 110,
            size: 12,
            font: fontBold,
            color: rgb(0, 0, 0),
        });

        let yPosition = height - 150;
        
        const addSection = (title, content) => {
            page.drawText(`${title}:`, {
                x: 50,
                y: yPosition,
                size: 10,
                font: fontBold,
                color: rgb(0, 0, 0),
            });
            
            page.drawText(content, {
                x: 200,
                y: yPosition,
                size: 10,
                font: font,
                color: rgb(0, 0, 0),
            });
            
            yPosition -= 20;
        };
        
        addSection('Tipo de Jornada', conv.tipo_jornada);
        addSection('Fecha de Inicio', new Date(conv.fecha_inicio).toLocaleDateString());
        addSection('Fecha de Fin', new Date(conv.fecha_fin).toLocaleDateString());
        addSection('Etapa', conv.etapa_convocatoria);
        addSection('Gestión', conv.gestion);
        addSection('Programa', conv.programa);
        addSection('Facultad', conv.facultad);
        
        yPosition -= 30;

        page.drawText('MATERIAS CONVOCADAS:', {
            x: 50,
            y: yPosition,
            size: 12,
            font: fontBold,
            color: rgb(0, 0, 0),
        });
        
        yPosition -= 30;
        
        page.drawText('Código', {
            x: 50,
            y: yPosition,
            size: 10,
            font: fontBold,
            color: rgb(0, 0, 0),
        });
        
        page.drawText('Materia', {
            x: 120,
            y: yPosition,
            size: 10,
            font: fontBold,
            color: rgb(0, 0, 0),
        });
        
        page.drawText('Horas', {
            x: 400,
            y: yPosition,
            size: 10,
            font: fontBold,
            color: rgb(0, 0, 0),
        });
        
        yPosition -= 20;
        
        for (const materia of materias.rows) {
            page.drawText(materia.cod_materia, {
                x: 50,
                y: yPosition,
                size: 10,
                font: font,
                color: rgb(0, 0, 0),
            });
            
            page.drawText(materia.materia, {
                x: 120,
                y: yPosition,
                size: 10,
                font: font,
                color: rgb(0, 0, 0),
            });
            
            page.drawText(materia.total_horas.toString(), {
                x: 400,
                y: yPosition,
                size: 10,
                font: font,
                color: rgb(0, 0, 0),
            });
            
            yPosition -= 20;
            
            if (yPosition < 50) {
                const newPage = pdfDoc.addPage([600, 800]);
                yPosition = 750;
            }
        }
        
        const pdfBytes = await pdfDoc.save();
        const pdfBase64 = pdfBytes.toString('base64');

        await pool.query(
            `UPDATE convocatorias_archivos 
             SET nombre_archivo = $1, doc_conv = $2 
             WHERE id_convocatoria = $3`,
            [`convocatoria_${id}.pdf`, pdfBytes, id]
        );
        
     res.json({
            success: true,
            pdf: pdfBase64,
            fileName: `convocatoria_${id}.pdf`,
            message: 'PDF generado correctamente'
        });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename=convocatoria_${id}.pdf`);
        res.setHeader('Content-Length', pdfBytes.length);
        res.send(pdfBytes);
        
    } catch (error) {
        console.error('Error al generar PDF:', error);
        res.status(500).json({ 
            error: 'Error al generar el PDF de la convocatoria',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const uploadConvocatoriaFiles = async (req, res) => {
    const { id } = req.params;
    const files = req.files;
    
    if (!files || Object.keys(files).length === 0) {
        return res.status(400).json({ error: 'No se subieron archivos' });
    }
    
    try {
        // Verificar que la convocatoria existe
        const convocatoriaCheck = await pool.query(
            'SELECT id_convocatoria FROM convocatorias WHERE id_convocatoria = $1',
            [id]
        );
        
        if (convocatoriaCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Convocatoria no encontrada' });
        }
        
        // Preparar los datos para actualizar
        const updateData = {};
        const updateFields = [];
        const updateValues = [];
        let paramCount = 1;
        
        // Procesar cada tipo de archivo
        const fileTypes = {
            resolucion: 'resolucion',
            dictamen: 'dictamen',
            carta: 'carta',
            nota: 'nota',
            certificado_item: 'certificado_item',
            certificado_presupuestario: 'certificado_presupuestario'
        };
        
        for (const [field, fileType] of Object.entries(fileTypes)) {
            if (files[field]) {
                const file = files[field][0]; // Tomamos el primer archivo si hay múltiples
                updateData[field] = file.buffer;
                updateFields.push(`${fileType} = $${paramCount}`);
                updateValues.push(file.buffer);
                paramCount++;
            }
        }
        
        // Si no hay archivos válidos para actualizar
        if (updateFields.length === 0) {
            return res.status(400).json({ error: 'No se proporcionaron archivos válidos' });
        }
        
        // Actualizar la base de datos
        const query = `
            UPDATE convocatorias_archivos 
            SET ${updateFields.join(', ')} 
            WHERE id_convocatoria = $${paramCount}
            RETURNING *`;
        
        updateValues.push(id);
        const result = await pool.query(query, updateValues);
        
        res.json({
            success: true,
            message: 'Archivos subidos correctamente',
            updatedFields: updateFields.map(f => f.split(' = ')[0])
        });
        
    } catch (error) {
        console.error('Error al subir archivos:', error);
        res.status(500).json({ error: 'Error al subir archivos a la convocatoria' });
    }
};

const getConvocatoriaFiles = async (req, res) => {
    const { id } = req.params;
    
    try {
        const result = await pool.query(
            'SELECT * FROM convocatorias_archivos WHERE id_convocatoria = $1',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No se encontraron archivos para esta convocatoria' });
        }
        
        // No enviamos los BYTEA directamente, solo metadatos
        const filesInfo = {
            nombre_archivo: result.rows[0].nombre_archivo,
            fecha_creacion: result.rows[0].fecha_creacion,
            has_resolucion: !!result.rows[0].resolucion,
            has_dictamen: !!result.rows[0].dictamen,
            has_carta: !!result.rows[0].carta,
            has_nota: !!result.rows[0].nota,
            has_certificado_item: !!result.rows[0].certificado_item,
            has_certificado_presupuestario: !!result.rows[0].certificado_presupuestario
        };
        
        res.json(filesInfo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const downloadConvocatoriaFile = async (req, res) => {
    const { id, fileType } = req.params;
    
    const validFileTypes = [
        'doc_conv', 'resolucion', 'dictamen', 
        'carta', 'nota', 'certificado_item', 
        'certificado_presupuestario'
    ];
    
    if (!validFileTypes.includes(fileType)) {
        return res.status(400).json({ error: 'Tipo de archivo no válido' });
    }
    
    try {
        const result = await pool.query(
            `SELECT ${fileType}, nombre_archivo FROM convocatorias_archivos 
             WHERE id_convocatoria = $1`,
            [id]
        );
        
        if (result.rows.length === 0 || !result.rows[0][fileType]) {
            return res.status(404).json({ error: 'Archivo no encontrado' });
        }
        
        const fileData = result.rows[0][fileType];
        let fileName = result.rows[0].nombre_archivo || `convocatoria_${id}_${fileType}`;
        
        // Determinar el tipo de contenido basado en la extensión del archivo
        let contentType = 'application/octet-stream';
        if (fileName.endsWith('.pdf')) {
            contentType = 'application/pdf';
        } else if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
            contentType = 'application/msword';
        } else if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
            contentType = 'image/jpeg';
        } else if (fileName.endsWith('.png')) {
            contentType = 'image/png';
        }
        
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
        res.send(fileData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const viewConvocatoriaPDF = async (req, res) => {
    const { id } = req.params;
    
    try {
        // Obtener el PDF guardado en la base de datos
        const result = await pool.query(
            'SELECT doc_conv FROM convocatorias_archivos WHERE id_convocatoria = $1',
            [id]
        );
        
        if (result.rows.length === 0 || !result.rows[0].doc_conv) {
            return res.status(404).json({ error: 'PDF no encontrado' });
        }
        
        const pdfBytes = result.rows[0].doc_conv;
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename=convocatoria_${id}.pdf`);
        res.send(pdfBytes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { generateConvocatoriaPDF, uploadConvocatoriaFiles, getConvocatoriaFiles, downloadConvocatoriaFile, viewConvocatoriaPDF };