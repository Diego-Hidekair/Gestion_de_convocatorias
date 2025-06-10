// frontend/src/components/convocatorias/ConvocatoriaArchivos/PDFViewer.js
import React from 'react';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';

const PDFViewer = ({ pdfUrl, onClose, onDownload }) => {
  return (
    <Modal isOpen toggle={onClose} size="xl" fullscreen="lg">
      <ModalHeader toggle={onClose}>
        <div className="d-flex justify-content-between w-100">
          <span>Vista previa del PDF</span>
          <button 
            className="btn btn-primary"
            onClick={onDownload}
          >
            Descargar
          </button>
        </div>
      </ModalHeader>
      <ModalBody style={{ height: '80vh', padding: 0 }}>
        <iframe 
          src={pdfUrl}
          title="PDF Viewer"
          style={{ width: '100%', height: '100%', border: 'none' }}
        />
      </ModalBody>
    </Modal>
  );
};

export default PDFViewer;