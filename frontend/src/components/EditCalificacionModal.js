import React, { useState } from 'react';
import './Modal.css';

function EditCalificacionModal({ calificacion, onSave, onClose }) {
  const [valor, setValor] = useState(calificacion.valor || '');
  const [fecha, setFecha] = useState(calificacion.fecha || new Date().toISOString().slice(0, 10));
  const [error, setError] = useState('');
  
  const isNewCalificacion = !calificacion.id;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (valor === '' || valor < 0 || valor > 10) {
      setError('La calificación debe estar entre 0 y 10');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      setError('La fecha debe tener formato YYYY-MM-DD');
      return;
    }
    onSave({ ...calificacion, valor: Number(valor), fecha });
  };
  return (
    <div className="modal-bg">
      <form onSubmit={handleSubmit} className="modal-form">
        <h3>{isNewCalificacion ? 'Agregar Calificación' : 'Editar Calificación'}</h3>
        {isNewCalificacion && (
          <div className="form-group">
            <label>Información:</label>
            <p><strong>Estudiante:</strong> {calificacion.estudiante_nombre}</p>
            <p><strong>Materia:</strong> {calificacion.materia_nombre}</p>
          </div>
        )}
        <div className="form-group">
          <label>Valor:</label>
          <input 
            type="number" 
            value={valor} 
            onChange={e => setValor(e.target.value)} 
            min="0" 
            max="10" 
            step="0.1" 
            required 
            placeholder="Ingrese calificación (0-10)"
          />
        </div>
        <div className="form-group">
          <label>Fecha:</label>
          <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} required />
        </div>
        {error && <div className="error">{error}</div>}
        <button type="submit">Guardar</button>
        <button type="button" onClick={onClose} style={{marginLeft:10}}>Cancelar</button>
      </form>
    </div>
  );
}

export default EditCalificacionModal;
