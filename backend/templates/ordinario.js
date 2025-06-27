//backend/templates/ordinario.js
function generateOrdinarioHTML(convocatoria, materias, totalHoras) {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    * {
      color: black;
    }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      line-height: 1.5;
      margin: 0;
      padding: 0;
    }
    .contenido {
      padding: 4cm 2cm 2cm 2cm;
    }
    h1, h2 {
      text-align: center;
      font-weight: bold;
      text-transform: uppercase;
    }
    h1 { font-size: 24pt; margin-bottom: 20px; }
    h2 { font-size: 18pt; margin-bottom: 20px; }
    h3 {
      font-size: 14pt;
      font-weight: bold;
      margin-bottom: 10px;
      margin-left: 36pt;
      text-indent: -18pt;
    }
    p {
      text-align: justify;
      margin-bottom: 10px;
      text-indent: 36pt;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    th, td {
      border: 1px solid black;
      padding: 8px;
      text-align: center;
    }
    th {
      background-color: #f2f2f2;
      font-weight: bold;
    }
    .centrado { text-align: center; }
    strong { font-weight: bold; }
  </style>
</head>
<body>
  <div class="contenido">
    <h1>${convocatoria.etapa_convocatoria} CONVOCATORIA A CONCURSO DE MÉRITOS Y EXÁMENES DE COMPETENCIA</h1>
    <h2>PARA LA PROVISIÓN DE DOCENTE ORDINARIO PARA LA CARRERA DE ${(convocatoria.programa || '').toUpperCase()} - GESTIÓN ${new Date().getFullYear()}</h2>

    <p>
      En aplicación de las normativas vigentes y dictámenes emitidos, se convoca a los profesionales <strong>${convocatoria.perfil_profesional || 'No especificado'}</strong>...
    </p>

    <h3>1. MATERIA OBJETO DE LA CONVOCATORIA:</h3>
    <p><strong>DOCENTES ORDINARIOS</strong></p>
    <table>
      <thead>
        <tr>
          <th>SIGLA</th>
          <th>ASIGNATURA</th>
          <th>HORAS SEMANA</th>
          <th>PERFIL PROFESIONAL</th>
        </tr>
      </thead>
      <tbody>
        ${materias.map((m, i) => `
          <tr>
            <td>${m.cod_materia}</td>
            <td>${m.materia}</td>
            <td>${m.total_horas}</td>
            ${i === 0 ? `<td rowspan="${materias.length}">${convocatoria.perfil_profesional || 'No especificado'}</td>` : ''}
          </tr>
        `).join('')}
        <tr>
          <td colspan="2"><strong>TOTAL HORAS</strong></td>
          <td><strong>${totalHoras}</strong></td>
          <td></td>
        </tr>
      </tbody>
    </table>

    <h3>2. REQUISITOS MÍNIMOS HABILITANTES</h3>
    <p><strong>a)</strong> Carta de solicitud...</p>
    <p><strong>b)</strong> Curriculum vitae...</p>
    <p><strong>c)</strong> Fotocopia legalizada del Diploma Académico...</p>
    <p><strong>d)</strong> Fotocopia legalizada del Título en Provisión Nacional...</p>

    <p class="centrado">
      Potosí, ${new Date(convocatoria.fecha_inicio).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
    </p>
  </div>
</body>
</html>`;
}

module.exports = generateOrdinarioHTML;
