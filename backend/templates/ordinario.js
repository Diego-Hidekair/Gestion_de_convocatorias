//backend/templates/ordinario.js
function generateOrdinarioHTML(convocatoria, materias, totalHoras) {
  return `
  <!DOCTYPE html>
    <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { 
                    font-family: 'Times New Roman', Times, serif; 
                    line-height: 1.5; 
                    margin: 4cm 2cm 2cm 2cm; 
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
                    margin-left: 36pt;
                    text-indent: -18pt;
                }
                p { 
                    font-size: 12pt; 
                    text-align: justify; 
                    margin-bottom: 10px; 
                    text-indent: 36pt;
                }
                .centrado { 
                    text-align: center; 
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
                    font-weight: bold;
                }
                strong {
                    font-weight: bold;
                }
                .sangria {
                    margin-left: 36pt;
                }
            </style>
        </head>
        <body>
            <h1>${convocatoria.etapa_convocatoria} CONVOCATORIA A CONCURSO DE MERITOS Y EXAMENES DE COMPETENCIA</h1>
            <h2>PARA LA PROVISIÓN DE DOCENTE ORDINARIO PARA LA CARRERA DE ${(convocatoria.programa || '').toUpperCase()} - GESTIÓN ${new Date().getFullYear()}</h2>
            
            <p>
                En aplicación de la Nota de Instrucción N° 001/2023 y N° 043/2023 emitidas por el Señor Rector 
                de la Universidad, y por Dictamen de la Comisión Académica N° <strong>${convocatoria.dictamen || 'N/A'}</strong> homologado por la 
                Resolución del Honorable Consejo Universitario N° <strong>${convocatoria.resolucion || 'N/A'}</strong> y cumpliendo con la normativa 
                universitaria se convoca a los profesionales <strong>${convocatoria.perfil_profesional || 'No especificado'}</strong>, al 
                <strong>${convocatoria.etapa_convocatoria}</strong> CONCURSO DE MÉRITOS Y EXÁMENES DE COMPETENCIA para optar por la docencia 
                universitaria en la categoría de <strong>Docente Ordinario</strong> en aplicación del Art. 70 del Reglamento del Régimen Académico 
                Docente de la Universidad Boliviana, ingresando el ganador como docente Contratado, conforme lo 
                dispone el Art. 72 del mismo cuerpo normativo, para luego ser sometido a evaluación continua y 
                pasar a la categoría de titular, tal como lo establece el Art. 73 del Reglamento referido, como 
                <strong>Docente Ordinario</strong> en la siguiente asignatura:
            </p>

            <h3>1. MATERIA OBJETO DE LA ${convocatoria.etapa_convocatoria} CONVOCATORIA:</h3>
            <p class="sangria"><strong>DOCENTES ORDINARIOS</strong></p>
            
            <table>
                <thead>
                    <tr>
                        <th><strong>SIGLA</strong></th>
                        <th><strong>ASIGNATURA</strong></th>
                        <th><strong>HORAS SEMANA</strong></th>
                        <th><strong>PERFIL PROFESIONAL</strong></th>
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
                    <tr>
                        <td colspan="2"><strong>TOTAL HORAS</strong></td>
                        <td><strong>${totalHoras}</strong></td>
                        <td></td>
                    </tr>
                </tbody>
            </table>

            <p class="sangria">
                Podrán participar todos los profesionales con Título en Provisión Nacional otorgado por la  
                Universidad Boliviana que cumplan los siguientes requisitos mínimos habilitantes de acuerdo al XII  
                Congreso Nacional de Universidades.
            </p>

            <h3>2. REQUISITOS MÍNIMOS HABILITANTES</h3>
            
            <p class="sangria">
                <strong>a)</strong> Carta de solicitud de postulación dirigida al señor Decano de la Facultad de 
                <strong>${convocatoria.nombre_facultad}</strong> especificando la asignatura y sigla a la que postula.
            </p>
            
            <p class="sangria">
                <strong>b)</strong> Curriculum vitae debidamente documentado, adjuntando fotocopias simples. El convocante se 
                reservará el derecho de solicitar la presentación de los documentos originales. (Incisos c.1 y c.6 
                del Art. 77 del Reglamento del Régimen Académico Docente de la Universidad Boliviana).
            </p>
            
            <p class="sangria">
                <strong>c)</strong> Fotocopia legalizada del Diploma Académico por Secretaría General de la Universidad que  
                confirió dicho documento, el cual debe ser otorgado por una de las universidades del  
                Sistema de la Universidad Boliviana. (Art. 77 inc. C.2 Reglamento del Régimen Académico  
                Docente de la Universidad Boliviana) <strong>ACTUALIZADA</strong> conforme a la Resolución  
                Rectoral N° 410/2019.
            </p>
            
            <p class="sangria">
                <strong>d)</strong> Fotocopia legalizada del Título en Provisión Nacional por Secretaría General de la  
                Universidad que confirió dicho documento, el cual debe ser otorgado por una de las  
                Universidades del Sistema de la Universidad Boliviana. (Art.77 inc. C.2 Reglamento del  
                Régimen Académico Docente de la Universidad Boliviana) <strong>ACTUALIZADA</strong> conforme a  
                la Resolución Rectoral N° 410/2019.
            </p>

            <p class="centrado">
                Potosí, ${new Date(convocatoria.fecha_inicio).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
        </body>
    </html>
  `;
}
module.exports = generateOrdinarioHTML;
