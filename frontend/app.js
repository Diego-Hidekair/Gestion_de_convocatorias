/*document.getElementById('facultadForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const nombre_facultad = document.getElementById('nombre_facultad').value;

    const response = await fetch('http://localhost:5000/api/facultades', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nombre_facultad })
    });

    const data = await response.json();

    if (response.ok) {
        alert('Facultad creada exitosamente');
        document.getElementById('facultadForm').reset();
    } else {
        alert('Error al crear facultad: ' + data.error);
    }
});

document.getElementById('carreraForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const nombre_carrera = document.getElementById('nombre_carrera').value;
    const cod_facultad = document.getElementById('cod_facultad').value;

    const response = await fetch('http://localhost:5000/api/carreras', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nombre_carrera, cod_facultad })
    });

    const data = await response.json();

    if (response.ok) {
        alert('Carrera creada exitosamente');
        document.getElementById('carreraForm').reset();
    } else {
        alert('Error al crear carrera: ' + data.error);
    }
});

document.getElementById('convocatoriaForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const nombre_convocatoria = document.getElementById('nombre_convocatoria').value;
    const cod_carrera = document.getElementById('cod_carrera').value;
    const cod_facultad = document.getElementById('cod_facultad_convocatoria').value;

    const response = await fetch('http://localhost:5000/api/convocatorias', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nombre_convocatoria, cod_carrera, cod_facultad })
    });

    const data = await response.json();

    if (response.ok) {
        alert('Convocatoria creada exitosamente');
        document.getElementById('convocatoriaForm').reset();
    } else {
        alert('Error al crear convocatoria: ' + data.error);
    }
});
*/