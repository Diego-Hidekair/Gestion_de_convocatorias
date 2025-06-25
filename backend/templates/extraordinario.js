function generateExtraordinarioHTML(convocatoria, materias, totalHoras) {
return `
    <html>
        <head>
            <style>
                body { font-family: 'Times New Roman', Times, serif; line-height: 1.5; margin: 4cm 2cm 2cm 2cm; }
                h1 { font-size: 24pt; font-weight: bold; text-align: center; text-transform: uppercase; margin-bottom: 20px; }
                h2 { font-size: 18pt; font-weight: bold; text-align: center; text-transform: uppercase; margin-bottom: 20px; }
                p { font-size: 12pt; text-align: justify; margin-bottom: 10px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; margin-bottom: 20px; }
                th, td { text-align: center; border: 1px solid black; padding: 8px; }
            </style>
        </head>
        <body>
            <h1>${convocatoria.nombre_conv}</h1>
            <h2>${convocatoria.nombre_tipo_conv}</h2>
            <p>
                Convocatoria extraordinaria para la carrera de ${convocatoria.programa}, 
                Facultad de ${convocatoria.nombre_facultad}, con ${totalHoras} horas totales.
            </p>
            <table>
                <thead>
                    <tr>
                        <th>Materia</th>
                        <th>Horas</th>
                    </tr>
                </thead>
                <tbody>
                    ${materias.map(m => `
                        <tr>
                            <td>${m.materia}</td>
                            <td>${m.total_horas}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <p class="centrado">Potosí, ${new Date(convocatoria.fecha_inicio).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </body>
    </html>
    `;
}
module.exports = generateExtraordinarioHTML;
