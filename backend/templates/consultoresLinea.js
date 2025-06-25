function generateConsultoresLineaHTML(convocatoria, materias, totalHoras) {
 return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: 'Times New Roman', Times, serif; line-height: 1.5; margin: 4cm 2cm 2cm 2cm; }
            h1 { font-size: 24pt; font-weight: bold; text-align: center; text-transform: uppercase; margin-bottom: 20px; }
            h2 { font-size: 18pt; font-weight: bold; text-align: center; text-transform: uppercase; margin-bottom: 20px; }
            h3 { font-size: 14pt; font-weight: bold; text-align: left; margin-bottom: 10px; }
            p { font-size: 12pt; text-align: justify; margin-bottom: 10px; }
            .centrado { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; margin-bottom: 20px; }
            th, td { text-align: center; border: 1px solid black; padding: 8px; }
            th { background-color: #f2f2f2; }
        </style>
    </head>
    <body>
        <h1>${convocatoria.nombre_conv}</h1>
        <h2>${convocatoria.nombre_tipo_conv}</h2>
        
        <p>
            Por determinación del Consejo de Carrera de <strong>${convocatoria.programa}</strong>, 
            mediante Dictamen N° <strong>${convocatoria.dictamen || 'N/A'}</strong>; homologado por Resolución del Consejo Facultativo N° 
            <strong>${convocatoria.resolucion || 'N/A'}</strong> de la Facultad de <strong>${convocatoria.nombre_facultad}</strong>, 
            se convoca a los profesionales en ${convocatoria.programa} al <strong>CONCURSO DE MÉRITOS</strong> 
            para optar por la docencia universitaria, como Docente Consultor de Línea a 
            <strong>${convocatoria.tipo_jornada}</strong> para la gestión académica 
            ${convocatoria.etapa_convocatoria}.
        </p>

        <h3>Tiempo de trabajo: ${convocatoria.tipo_jornada}</h3>
        
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
                ${materias.map((m, index) => `
                    <tr>
                        <td>${m.cod_materia}</td>
                        <td>${m.materia}</td>
                        <td>${m.total_horas}</td>
                        ${index === 0 ? `<td rowspan="${materias.length}">${convocatoria.perfil_profesional || 'No especificado'}</td>` : ''}
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        <h3>Total Horas: ${totalHoras}</h3>
        
        <p class="centrado">
            Potosí, ${new Date(convocatoria.fecha_inicio).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
    </body>
    </html>
    `;
}
module.exports = generateConsultoresLineaHTML;
