import React, { useState, useEffect } from 'react';
import './Modal.css';
import { apiRequest } from '../api';

const TIPOS_SUGERIDOS = [
  'maltrato al inmobiliario',
  'bullying',
  'posesión de armas blancas',
  'uniforme modificado',
  'exhibicionismo'
];

function IncidenciaModal({ incidencia, onSave, onClose }) {  const [tipo, setTipo] = useState(incidencia?.tipo || '');
  const [descripcion, setDescripcion] = useState(incidencia?.descripcion || '');
  const [estudianteId, setEstudianteId] = useState(incidencia?.estudiante_id || incidencia?.usuario_id || '');
  const [fecha, setFecha] = useState(incidencia?.fecha || new Date().toISOString().slice(0,10));
  const [sancion, setSancion] = useState(incidencia?.sancion || '');
  const [justificada, setJustificada] = useState(incidencia?.justificada || false);
  const [error, setError] = useState('');
  const [estudiantes, setEstudiantes] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [talleres, setTalleres] = useState([]);
  const [materiaId, setMateriaId] = useState(incidencia?.materia_id || '');
  const [tallerId, setTallerId] = useState(incidencia?.taller_id || '');

  useEffect(() => {
    async function fetchEstudiantes() {
      try {
        const data = await apiRequest('/estudiantes', { method: 'GET' });
        // Filtrar solo alumnos (rol estudiante)
        setEstudiantes(data.filter(e => e.rol === 'estudiante'));
      } catch (e) {
        setError('No se pudieron cargar los estudiantes');
        setEstudiantes([]);
      }
    }
    async function fetchMaterias() {
      try {
        const data = await apiRequest('/materias', { method: 'GET' });
        setMaterias(data);
      } catch {
        setMaterias([]);
      }
    }
    async function fetchTalleres() {
      try {
        const data = await apiRequest('/talleres', { method: 'GET' });
        setTalleres(data);
      } catch {
        setTalleres([]);
      }
    }
    fetchEstudiantes();
    fetchMaterias();
    fetchTalleres();
  }, []);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!tipo.trim() || !descripcion.trim() || !estudianteId || !fecha) {
      setError('Todos los campos obligatorios deben completarse');
      return;
    }
    
    // Validar que se seleccione materia O taller, pero no ambos obligatorios
    if (!materiaId && !tallerId) {
      setError('Debe seleccionar al menos una materia o un taller');
      return;
    }
    
    onSave({ 
      ...incidencia, 
      usuario_id: estudianteId, 
      estudiante_id: estudianteId,
      tipo,
      fecha, 
      descripcion, 
      materia_id: materiaId || null, 
      taller_id: tallerId || null, 
      sancion 
    });
  };

  return (
    <div className="modal-bg">
      <form onSubmit={handleSubmit} className="modal-form">
        <h3>{incidencia?.id ? 'Editar incidencia' : 'Nueva incidencia'}</h3>        <div className="form-group">
          <label>Tipo de incidencia:</label>
          <select value={tipo} onChange={e => setTipo(e.target.value)} required>
            <option value="">Selecciona un tipo</option>
            {TIPOS_SUGERIDOS.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Alumno:</label>
          <select value={estudianteId} onChange={e => setEstudianteId(e.target.value)} required>
            <option value="">Selecciona un alumno</option>
            {estudiantes.map(e => (
              <option key={e.id_usuario} value={e.id_usuario}>
                {e.nombre} {e.matricula && `(${e.matricula})`}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Materia (opcional):</label>
          <select 
            value={materiaId} 
            onChange={e => {
              setMateriaId(e.target.value);
              if (e.target.value) setTallerId(''); // Si selecciona materia, limpia taller
            }}
          >
            <option value="">Selecciona una materia</option>
            {materias.map(m => (
              <option key={m.id_materia} value={m.id_materia}>{m.nombre}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Taller (opcional):</label>
          <select 
            value={tallerId} 
            onChange={e => {
              setTallerId(e.target.value);
              if (e.target.value) setMateriaId(''); // Si selecciona taller, limpia materia
            }}
          >            <option value="">Selecciona un taller</option>
            {talleres.map(t => (
              <option key={t.id_taller || t.id} value={t.id_taller || t.id}>{t.nombre}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Fecha:</label>
          <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Descripción:</label>
          <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} required />
        </div>        <div className="form-group">
          <label>Sanción (opcional):</label>
          <select value={sancion} onChange={e => setSancion(e.target.value)}>
            <option value="">Sin sanción asignada</option>
            <option value="llamado">Llamado de atención</option>
            <option value="suspension">Suspensión</option>
            <option value="expulsion">Expulsión</option>
          </select>
        </div>
        {error && <div className="error">{error}</div>}
        <div style={{display:'flex', gap:8, marginTop:16}}>
          <button type="submit">Guardar</button>
          <button type="button" onClick={onClose}>Cancelar</button>
        </div>
      </form>
    </div>
  );
}

export default IncidenciaModal;
