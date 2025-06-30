import React, { useEffect, useState } from 'react';
import { apiRequest } from '../api';
import EditCalificacionModal from './EditCalificacionModal';
import { useAuth } from '../AuthContext';
import { useNotification } from '../NotificationContext';
import Layout from './Layout';

function CalificacionesList() {
  const [calificaciones, setCalificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated, user } = useAuth();
  const [editCalificacion, setEditCalificacion] = useState(null);
  const [addCalificacion, setAddCalificacion] = useState(null);
  const [saving, setSaving] = useState(false);
  const { showNotification } = useNotification();
  const [success, setSuccess] = useState('');
  const [localError, setLocalError] = useState('');
  const [sistemaHabilitado, setSistemaHabilitado] = useState(false);
  const [habilitando, setHabilitando] = useState(false);
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(null);

  useEffect(() => {
    if (!user) return;
    // Si es padre, inicializar estudianteSeleccionado si no está definido
    if (user.rol === 'padre' && user.estudiantes && user.estudiantes.length > 0 && !estudianteSeleccionado) {
      setEstudianteSeleccionado(user.estudiantes[0].id_usuario);
    }
  }, [user, estudianteSeleccionado]);

  useEffect(() => {
    if (!user) return;
    async function fetchCalificaciones() {
      try {
        let endpoint = '/calificaciones';
        if (user?.rol === 'docente') endpoint = '/calificaciones/docente';
        if (user?.rol === 'estudiante') endpoint = `/calificaciones/estudiante/${user.id_usuario}`;
        if (user?.rol === 'padre') {
          if (!estudianteSeleccionado) return;
          endpoint = `/calificaciones/estudiante/${estudianteSeleccionado}`;
        }
        const data = await apiRequest(endpoint, { method: 'GET' });
        setCalificaciones(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchCalificaciones();
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

  // Consultar estado del sistema al cargar
  useEffect(() => {
    async function fetchEstado() {
      try {
        const resp = await apiRequest('/calificaciones', { method: 'OPTIONS' });
        setSistemaHabilitado(resp && resp.sistemaHabilitado);
      } catch {}
    }
    fetchEstado();
  }, []);

  if (loading) return <div>Cargando calificaciones...</div>;
  if (error) return <div style={{color:'red'}}>Error: {error}</div>;

  const handleEdit = (cal) => setEditCalificacion(cal);
  const handleAdd = (c) => setAddCalificacion(c);
  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta calificación?')) return;
    setSaving(true);
    setSuccess('');
    setLocalError('');
    try {
      await apiRequest(`/calificaciones/${id}`, { method: 'DELETE' });
      setCalificaciones(calificaciones.filter(c => c.id !== id));
      setSuccess('Calificación eliminada correctamente');
      showNotification('Calificación eliminada correctamente', 'success');
    } catch (err) {
      setLocalError(err.message);
      showNotification(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };
  const handleSave = async (cal) => {
    setSaving(true);
    setSuccess('');
    setLocalError('');
    try {
      const updated = await apiRequest(`/calificaciones/${cal.id}`, {
        method: 'PUT',
        body: JSON.stringify({ calificacion: cal.valor, fecha: cal.fecha }),
      });
      setCalificaciones(calificaciones.map(c => c.id === cal.id ? { ...c, valor: updated.calificacion, fecha: updated.fecha } : c));
      setEditCalificacion(null);
      setSuccess('Calificación actualizada correctamente');
      showNotification('Calificación actualizada correctamente', 'success');
    } catch (err) {
      setLocalError(err.message);
      showNotification(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };  const handleSaveAdd = async (cal) => {
    setSaving(true);
    setSuccess('');
    setLocalError('');
    try {
      // POST: crear nueva calificación
      const today = new Date();
      const fecha = today.toISOString().slice(0, 10); // YYYY-MM-DD
      
      // Asegurar que los campos están correctamente mapeados
      const payload = {
        estudiante_id: cal.estudiante_id,
        materia_id: cal.materia_id,
        calificacion: Number(cal.valor),
        fecha: cal.fecha || fecha
      };
      
      // Validar que todos los campos requeridos estén presentes
      if (!payload.estudiante_id || !payload.materia_id || payload.calificacion === undefined || !payload.fecha) {
        console.log('Datos recibidos:', cal);
        console.log('Payload generado:', payload);
        throw new Error('Faltan datos requeridos para crear la calificación');
      }
      
      console.log('Enviando calificación:', payload); // Para debug
      
      const created = await apiRequest(`/calificaciones`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      // Recargar las calificaciones desde el servidor
      let endpoint = '/calificaciones';
      if (user?.rol === 'docente') endpoint = '/calificaciones/docente';
      if (user?.rol === 'estudiante') endpoint = `/calificaciones/estudiante/${user.id_usuario}`;
      if (user?.rol === 'padre') {
        if (!estudianteSeleccionado) return;
        endpoint = `/calificaciones/estudiante/${estudianteSeleccionado}`;
      }
      const data = await apiRequest(endpoint, { method: 'GET' });
      setCalificaciones(data);
      
      setAddCalificacion(null);
      setSuccess('Calificación agregada correctamente');
      showNotification('Calificación agregada correctamente', 'success');
    } catch (err) {
      setLocalError(err.message);
      showNotification(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  async function toggleSistema() {
    setHabilitando(true);
    try {
      await apiRequest('/calificaciones/habilitar', {
        method: 'POST',
        body: JSON.stringify({ habilitado: !sistemaHabilitado })
      });
      setSistemaHabilitado(!sistemaHabilitado);
      showNotification(`Sistema de calificaciones ${!sistemaHabilitado ? 'habilitado' : 'deshabilitado'}`, 'success');
    } catch (err) {
      showNotification('Error al cambiar el estado del sistema', 'error');
    } finally {
      setHabilitando(false);
    }
  }

  // Agrupa las calificaciones por grupo (anio y turno)
  function agruparPorGrupo(calificaciones) {
    const grupos = {};
    calificaciones.forEach(c => {
      const key = `${c.grupo_anio || c.anio || '-'}° ${c.grupo_turno || '-'}`;
      if (!grupos[key]) grupos[key] = [];
      grupos[key].push(c);
    });
    return grupos;
  }

  const calificacionesPorGrupo = agruparPorGrupo(calificaciones);
  return (
    <Layout title="Calificaciones">
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
      {/* Botón solo visible para admin */}
      {isAuthenticated && isAuthenticated.rol === 'admin' && (
        <button onClick={toggleSistema} disabled={habilitando} style={{marginBottom:12}}>
          {sistemaHabilitado ? 'Deshabilitar sistema de calificaciones' : 'Habilitar sistema de calificaciones'}
        </button>
      )}
      {success && <div style={{color:'green', marginBottom:8}}>{success}</div>}
      {localError && <div style={{color:'red', marginBottom:8}}>{localError}</div>}
      {saving && <div>Guardando cambios...</div>}
      <div style={{overflowX:'auto'}}>
        {Object.entries(calificacionesPorGrupo).map(([grupo, califs]) => (
          <div key={grupo} style={{marginBottom:32}}>
            <h3 style={{marginTop:24, marginBottom:8}}>{grupo}</h3>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Estudiante</th>
                  <th>Matrícula</th>
                  <th>Materia</th>
                  <th>Calificación</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {califs.map(c => (
                  <tr key={c.estudiante_id + '-' + (c.id || c.materiaId)}>
                    <td>{c.id || '-'}</td>
                    <td>{c.estudiante_nombre || c.estudianteId}</td>
                    <td>{c.estudiante_matricula || c.matricula || '-'}</td>
                    <td>{c.materia_nombre || c.materiaId}</td>
                    <td>{c.valor !== null && c.valor !== undefined ? c.valor : 'Sin calificación'}</td>
                    <td>{c.fecha || '-'}</td>
                    <td>
                      {/* Solo admin y docente pueden editar/agregar/eliminar */}
                      {(user?.rol === 'admin' || user?.rol === 'docente') && (
                        <>
                          {c.id ? (
                            <button onClick={() => handleEdit(c)} title="Editar">✏️</button>
                          ) : (
                            <button onClick={() => handleAdd(c)} title="Agregar calificación">➕</button>
                          )}
                          {c.id && (
                            <button onClick={() => handleDelete(c.id)} style={{marginLeft:8}} title="Eliminar">🗑️</button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
      {/* Modales solo para admin/docente */}
      {(user?.rol === 'admin' || user?.rol === 'docente') && editCalificacion && (
        <EditCalificacionModal
          calificacion={editCalificacion}
          onSave={handleSave}
          onClose={() => setEditCalificacion(null)}
        />
      )}
      {(user?.rol === 'admin' || user?.rol === 'docente') && addCalificacion && (
        <EditCalificacionModal
          calificacion={addCalificacion}
          onSave={handleSaveAdd}
          onClose={() => setAddCalificacion(null)}        />
      )}
      </div>
    </Layout>
  );
}

export default CalificacionesList;
