import React, { useEffect, useState } from 'react';
import { apiRequest } from '../api';
import JustificarModal from './JustificarModal';
import { useAuth } from '../AuthContext';
import { useNotification } from '../NotificationContext';
import Layout from './Layout';

function AsistenciasList() {
  const [asistencias, setAsistencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated, user } = useAuth();
  const [justificarAsistencia, setJustificarAsistencia] = useState(null);
  const [saving, setSaving] = useState(false);
  const { showNotification } = useNotification();
  const [success, setSuccess] = useState('');
  const [localError, setLocalError] = useState('');
  // NUEVO: Estado para el estudiante seleccionado (solo para padres)
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(null);

  // Inicializar estudiante seleccionado si es padre
  useEffect(() => {
    if (!user) return;
    if (user.rol === 'padre' && user.estudiantes && user.estudiantes.length > 0 && !estudianteSeleccionado) {
      setEstudianteSeleccionado(user.estudiantes[0].id_usuario);
    }
  }, [user, estudianteSeleccionado]);

  useEffect(() => {
    if (!user) return; // Esperar a que user esté definido
    async function fetchAsistencias() {
      try {
        let endpoint = '/asistencias';
        if (user?.rol === 'docente') endpoint = '/asistencias/docente';
        if (user?.rol === 'estudiante') endpoint = `/asistencias/usuario/${user.id_usuario}`;
        if (user?.rol === 'padre') {
          if (!estudianteSeleccionado) return;
          endpoint = `/asistencias/usuario/${estudianteSeleccionado}`;
        }
        const data = await apiRequest(endpoint, { method: 'GET' });
        setAsistencias(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchAsistencias();
  }, [user, estudianteSeleccionado]);

  useEffect(() => {
    if (success || localError) {
      const timer = setTimeout(() => {
        setSuccess('');
        setLocalError('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, localError]);

  const handleJustificar = (asistencia) => setJustificarAsistencia(asistencia);
  const handleSaveJustificacion = async (asistencia) => {
    setSaving(true);
    setSuccess('');
    setLocalError('');
    try {
      const updated = await apiRequest(`/asistencias/${asistencia.id}/justificar`, {
        method: 'PUT',
        body: JSON.stringify({ justificacion: asistencia.justificacion }),
      });
      setAsistencias(asistencias.map(a => a.id === asistencia.id ? { ...a, justificacion: updated.justificacion } : a));
      setJustificarAsistencia(null);
      setSuccess('Falta justificada correctamente');
      showNotification('Falta justificada correctamente', 'success');
    } catch (err) {
      setLocalError(err.message);
      showNotification(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Cargando asistencias...</div>;
  if (error) return <div style={{color:'red'}}>Error: {error}</div>;
  return (
    <Layout title="Asistencias">
      <div>
        {/* Selector de estudiante solo para padres con más de un hijo */}
        {user?.rol === 'padre' && user.estudiantes && user.estudiantes.length > 1 && (
        <div style={{ marginBottom: 16 }}>
          <label>Selecciona estudiante:&nbsp;</label>
          <select value={estudianteSeleccionado || ''} onChange={e => setEstudianteSeleccionado(Number(e.target.value))}>
            {user.estudiantes.map(est => (
              <option key={est.id_usuario} value={est.id_usuario}>{est.nombre}</option>
            ))}
          </select>
        </div>
      )}
      {success && <div style={{color:'green', marginBottom:8}}>{success}</div>}
      {localError && <div style={{color:'red', marginBottom:8}}>{localError}</div>}
      {saving && <div>Guardando justificación...</div>}
      <div style={{overflowX:'auto'}}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Estudiante</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Justificación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {asistencias.map(a => (
              <tr key={a.id}>
                <td>{a.id}</td>
                <td>{a.estudiante_nombre || a.estudianteId}</td>
                <td>{a.fecha}</td>
                <td>{a.estado}</td>
                <td>{a.justificacion || '-'}</td>
                <td>
                  {/* Solo admin y docente pueden justificar */}
                  {a.estado === 'FALTA' && (user?.rol === 'admin' || user?.rol === 'docente') && (
                    <button onClick={() => handleJustificar(a)} title="Justificar">📝</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Modal solo para admin/docente */}
      {(user?.rol === 'admin' || user?.rol === 'docente') && justificarAsistencia && (
        <JustificarModal
          asistencia={justificarAsistencia}
          onSave={handleSaveJustificacion}
          onClose={() => setJustificarAsistencia(null)}        />
      )}
      </div>
    </Layout>
  );
}

export default AsistenciasList;
