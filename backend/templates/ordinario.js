// backend/templates/ordinario.js

function generateOrdinarioHTML(convocatoria, materias, totalHoras) {
  const fechaInicio = new Date(convocatoria.fecha_inicio);
  const fechaFin = new Date(convocatoria.fecha_fin);
  const diaSemana = fechaFin.toLocaleDateString('es-ES', { weekday: 'long' });
  const diaFin = fechaFin.getDate().toString().padStart(2, '0');
  const mesFin = fechaFin.toLocaleDateString('es-ES', { month: 'long' });
  const anioFin = fechaFin.getFullYear();
  const anioCreacion = new Date().getFullYear();

  const gestionTexto = convocatoria.gestion === 'GESTION 1'
    ? `GESTIÓN ACADÉMICA 1/${fechaInicio.toLocaleDateString('es-ES')}`
    : `GESTIÓN ACADÉMICA 2/${anioCreacion}`;

  const nombreCarrera = convocatoria.programa;
  const nombreFacultad = convocatoria.nombre_facultad;
  const tipoJornada = convocatoria.tipo_jornada;
  const perfilProfesional = convocatoria.perfil_profesional || 'No especificado';
  const pagoMensual = convocatoria.pago_mensual || 0;

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
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
      padding: 2cm 2cm 2cm 2cm;
    }
    h1, h2 {
      text-align: center;
      font-weight: bold;
      text-transform: uppercase;
    }
    h1 { 
      font-size: 14pt; 
      margin-bottom: 20px; 
      text-decoration: underline;
    }
    h2 { 
      font-size: 12pt; 
      margin-bottom: 20px; 
      text-decoration: underline;
    }
    h3 {
      font-size: 12pt;
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
      padding: 5px;
      text-align: center;
      font-size: 10pt;
    }
    th {
      background-color: #e0e0e0;
    }
    .firma {
      width: 100%;
      margin-top: 50px;
    }
    .firma td {
      border: none;
      padding-top: 50px;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="contenido">
    <h1>${convocatoria.etapa_convocatoria} CONVOCATORIA A CONCURSO DE MÉRITOS</h1>
    <h2>PARA LA CONTRATACIÓN DE DOCENTES EN CALIDAD DE CONSULTORES DE LÍNEA A ${tipoJornada}</h2>
    <p>La Carrera de <strong>${nombreCarrera}</strong>, Facultad de <strong>${nombreFacultad}</strong>, convoca al concurso...</p>

    <h3>1. MATERIAS OBJETO DE LA CONVOCATORIA</h3>
    <table>
      <thead>
        <tr>
          <th>SIGLA</th>
          <th>MATERIA</th>
          <th>HORAS SEMANA</th>
        </tr>
      </thead>
      <tbody>
        ${materias.map(m => `
          <tr>
            <td>${m.cod_materia}</td>
            <td>${m.materia}</td>
            <td>${m.total_horas}</td>
          </tr>`).join('')}
        <tr>
          <td colspan="2"><strong>Total Horas</strong></td>
          <td><strong>${totalHoras}</strong></td>
        </tr>
      </tbody>
    </table>

    <h3>2. REQUISITOS</h3>
    <p>Los interesados deberán presentar la siguiente documentación mínima para la postulación:</p>
    <ul>
      <li>Carta de postulación dirigida al Señor Rector.</li>
      <li>Currículum vitae documentado.</li>
      <li>Fotocopia legalizada del Diploma Académico.</li>
      <li>Fotocopia legalizada del Título en Provisión Nacional.</li>
      <li>Fotocopia de la Cédula de Identidad.</li>
      <li>Fotocopia del Título de Maestría o Diplomado.</li>
      <li>Certificación de experiencia profesional no menor a dos años.</li>
      <li>Certificación de no tener procesos disciplinarios.</li>
      <li>Certificación de no tener antecedentes anti-autonomistas.</li>
      <li>Plan de trabajo para las materias postuladas.</li>
      <li>Certificación de no tener cuentas pendientes.</li>
      <li>Declaración jurada ante Notario de Fe Pública.</li>
      <li>Certificación de manejo de entornos virtuales.</li>
    </ul>

    <h3>3. HONORARIOS</h3>
    <table>
      <tr>
        <th>Docente consultor de línea</th>
        <th>Pago mensual (Bs.)</th>
      </tr>
      <tr>
        <td>${perfilProfesional} (${tipoJornada})</td>
        <td>${pagoMensual}</td>
      </tr>
    </table>

    <h3>4. POSTULACIONES</h3>
    <p>Las postulaciones se realizarán ante la Secretaría Académica hasta el día <strong>${diaSemana} ${diaFin} de ${mesFin} de ${anioFin}</strong>.</p>

    <p class="centrado">Potosí, ${fechaInicio.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

    <table class="firma">
      <tr>
        <td>M. Sc. Lic. Alberto Morales Colque<br><strong>Decano FF.CC.EE.FF.AA.</strong></td>
        <td><strong>Vº Bº</strong></td>
        <td>M.Sc. Ing. David Soraide Lozano<br><strong>Vicerrector U.A.T.F.</strong></td>
      </tr>
    </table>
  </div>
</body>
</html>
`;
}

module.exports = generateOrdinarioHTML;
