import React, { useState } from 'react';
import axios from 'axios';

/*const CarreraForm = () => {
    const [nombreCarrera, setNombreCarrera] = useState('');
    const [codFacultad, setCodFacultad] = useState('');
    const [facultades, setFacultades] = useState([]);

    useEffect(() => {
        const fetchFacultades = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/facultades');
                setFacultades(response.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchFacultades();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/carreras', {
                Nombre_carrera: nombreCarrera,
                Cod_facultad: codFacultad
            });
            console.log(response.data);
            setNombreCarrera('');
            setCodFacultad('');
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Nombre de la Carrera:</label>
                <input
                    type="text"
                    value={nombreCarrera}
                    onChange={(e) => setNombreCarrera(e.target.value)}
                />
            </div>
            <div>
                <label>Facultad:</label>
                <select value={codFacultad} onChange={(e) => setCodFacultad(e.target.value)}>
                    <option value="">Seleccione una facultad</option>
                    {facultades.map((facultad) => (
                        <option key={facultad.Cod_facultad} value={facultad.Cod_facultad}>
                            {facultad.Nombre_facultad}
                        </option>
                    ))}
                </select>
            </div>
            <button type="submit">Crear Carrera</button>
        </form>
    );
};

export default CarreraForm;
*/
function CarreraForm() {
    const [nombre_carrera, setNombreCarrera] = useState('');
    const [cod_facultad, setCodFacultad] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/carreras', { nombre_carrera, cod_facultad });
            alert('Carrera creada exitosamente');
            setNombreCarrera('');
            setCodFacultad('');
        } catch (error) {
            alert('Error al crear carrera: ' + error.message);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <label>
                Nombre Carrera:
                <input type="text" value={nombre_carrera} onChange={(e) => setNombreCarrera(e.target.value)} required />
            </label>
            <label>
                Código Facultad:
                <input type="number" value={cod_facultad} onChange={(e) => setCodFacultad(e.target.value)} required />
            </label>
            <button type="submit">Guardar</button>
        </form>
    );
}

export default CarreraForm;
