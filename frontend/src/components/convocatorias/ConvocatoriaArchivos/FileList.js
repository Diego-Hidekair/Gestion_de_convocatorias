// frontend/src/components/convocatorias/ConvocatoriaArchivos/FileList.js
import React from 'react';
import { ListGroup, ListGroupItem, Badge, Button } from 'reactstrap';

const FileList = ({ filesInfo, convocatoriaId }) => {
  if (!filesInfo) return null;

  const fileTypes = [
    { key: 'has_resolucion', label: 'Resolución', type: 'resolucion' },
    { key: 'has_dictamen', label: 'Dictamen', type: 'dictamen' },
    { key: 'has_carta', label: 'Carta', type: 'carta' },
    { key: 'has_nota', label: 'Nota', type: 'nota' },
    { key: 'has_certificado_item', label: 'Certificado de Ítem', type: 'certificado_item' },
    { key: 'has_certificado_presupuestario', label: 'Certificado Presupuestario', type: 'certificado_presupuestario' }
  ];

  const handleDownload = (fileType) => {
    window.open(
      `http://localhost:5000/convocatorias-archivos/${convocatoriaId}/descargar/${fileType}`,
      '_blank'
    );
  };

  return (
    <ListGroup>
      {fileTypes.map((fileType) => (
        <ListGroupItem key={fileType.key} className="d-flex justify-content-between align-items-center">
          <span>{fileType.label}</span>
          {filesInfo[fileType.key] ? (
            <div>
              <Badge color="success" className="me-2">Disponible</Badge>
              <Button 
                size="sm" 
                color="primary"
                onClick={() => handleDownload(fileType.type)}
              >
                Descargar
              </Button>
            </div>
          ) : (
            <Badge color="secondary">No disponible</Badge>
          )}
        </ListGroupItem>
      ))}
    </ListGroup>
  );
};

export default FileList;