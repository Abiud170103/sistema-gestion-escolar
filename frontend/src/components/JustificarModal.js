import React, { useState } from 'react';
import './Modal.css';

function JustificarModal({ asistencia, onSave, onClose }) {
  const [justificacion, setJustificacion] = useState(asistencia.justificacion || '');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!justificacion.trim()) {
      setError('La justificación no puede estar vacía');
      return;
    }
    onSave({ ...asistencia, justificacion });
  };

  return (
    <div className="modal-bg">
      <form onSubmit={handleSubmit} className="modal-form">
        <h3>Justificar Asistencia</h3>
        <div className="form-group">
          <label>Justificación:</label>
          <textarea value={justificacion} onChange={e => setJustificacion(e.target.value)} required rows={3} style={{width:'100%'}} />
        </div>
        {error && <div className="error">{error}</div>}
        <button type="submit">Guardar</button>
        <button type="button" onClick={onClose} style={{marginLeft:10}}>Cancelar</button>
      </form>
    </div>
  );
}

export default JustificarModal;
