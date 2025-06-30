import React, { useEffect, useState } from 'react';
import { apiRequest } from '../api';
import { useAuth } from '../AuthContext';
import IncidenciaModal from './IncidenciaModal';
import { useNotification } from '../NotificationContext';
import Layout from './Layout';

function IncidenciasList() {
  const [incidencias, setIncidencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalIncidencia, setModalIncidencia] = useState(null);
  const [saving, setSaving] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [success, setSuccess] = useState('');
  const [localError, setLocalError] = useState('');
  const { user } = useAuth();
  const { showNotification } = useNotification();
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
    if (!user) return;
    // Si es padre y aún no hay estudiante seleccionado, no consultar nada
    if (user.rol === 'padre' && !estudianteSeleccionado) return;
    async function fetchIncidencias() {
      try {
        let endpoint = '/incidencias';
        if (user?.rol === 'docente') endpoint = '/incidencias/docente';
        if (user?.rol === 'estudiante') endpoint = `/incidencias/usuario/${user.id_usuario}`;
        if (user?.rol === 'padre') endpoint = `/incidencias/usuario/${estudianteSeleccionado}`;
        const data = await apiRequest(endpoint, { method: 'GET' });
        setIncidencias(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchIncidencias();
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

  const handleNueva = () => setModalIncidencia({});
  const handleEditar = (incidencia) => setModalIncidencia(incidencia);

  const handleSave = async (inc) => {
    setSaving(true);
    setSuccess('');
    setLocalError('');
    try {
      if (inc.id) {
        // Editar
        const updated = await apiRequest(`/incidencias/${inc.id}`, {
          method: 'PUT',
          body: JSON.stringify({ tipo: inc.tipo, descripcion: inc.descripcion })
        });
        setIncidencias(incidencias.map(i => i.id === inc.id ? updated : i));
        setSuccess('Incidencia actualizada correctamente');
        showNotification('Incidencia actualizada correctamente', 'success');      } else if (user?.rol === 'docente') {
        // Docente: crear solicitud de incidencia
        const created = await apiRequest('/incidencias', {
          method: 'POST',
          body: JSON.stringify({
            usuario_id: inc.usuario_id || inc.estudiante_id,
            tipo: inc.tipo,
            descripcion: inc.descripcion,
            fecha: inc.fecha || new Date().toISOString().slice(0,10),
            sancion: inc.sancion || '',
            materia_id: inc.materia_id || null,
            taller_id: inc.taller_id || null
          })
        });
        setIncidencias([created, ...incidencias]);
        setSuccess('Incidencia registrada correctamente');
        showNotification('Incidencia registrada correctamente', 'success');
      } else {        // Admin u otro: crear incidencia directa
        const created = await apiRequest('/incidencias', {
          method: 'POST',
          body: JSON.stringify({
            usuario_id: inc.usuario_id || inc.estudiante_id,
            tipo: inc.tipo,
            descripcion: inc.descripcion,
            fecha: inc.fecha || new Date().toISOString().slice(0,10),
            sancion: inc.sancion || '',
            materia_id: inc.materia_id || null,
            taller_id: inc.taller_id || null
          })
        });
        setIncidencias([created, ...incidencias]);
        setSuccess('Incidencia creada correctamente');
        showNotification('Incidencia creada correctamente', 'success');
      }
      setModalIncidencia(null);
    } catch (err) {
      setLocalError(err.message);
      showNotification(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Cargando incidencias...</div>;
  if (error) return <div style={{color:'red'}}>Error: {error}</div>;
  
  // Título dinámico según el rol
  const getTitle = () => {
    switch (user?.rol) {
      case 'estudiante': return 'Mis Incidencias';
      case 'padre': return 'Incidencias del Estudiante';
      case 'docente': return 'Incidencias - Mis Grupos';
      case 'admin': return 'Gestión de Incidencias';
      default: return 'Incidencias';
    }
  };
  
  return (
    <Layout title={getTitle()}>
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
      {/* Botón de nueva incidencia solo para admin y docente */}
      {(user?.rol === 'admin' || user?.rol === 'docente') && (
        <button onClick={handleNueva} style={{marginBottom:10}}>➕ Nueva Incidencia</button>
      )}
      <div style={{overflowX:'auto'}}>
        {/* Mostrar tabla de incidencias */}        <table>
          <thead>
            <tr>
              <th>ID</th>
              {/* Solo mostrar columnas de estudiante/matrícula si no es el propio estudiante */}
              {user?.rol !== 'estudiante' && (
                <>
                  <th>Estudiante</th>
                  <th>Matrícula</th>
                </>
              )}
              <th>Tipo</th>
              <th>Descripción</th>
              <th>Fecha</th>
              <th>Materia/Taller</th>
              <th>Sanción</th>
              {/* Solo mostrar acciones para admin y docente */}
              {(user?.rol === 'admin' || user?.rol === 'docente') && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {incidencias.length === 0 ? (
              <tr>
                <td colSpan={user?.rol === 'estudiante' ? 6 : 8} style={{textAlign:'center', padding:'20px'}}>
                  {user?.rol === 'estudiante' 
                    ? '🎉 ¡Excelente! No tienes ninguna incidencia registrada.' 
                    : 'No hay incidencias registradas.'
                  }
                </td>
              </tr>
            ) : (
              incidencias.map(i => (
                <tr key={i.id_incidencia || i.id}>
                  <td>{i.id_incidencia || i.id}</td>
                  {/* Solo mostrar datos del estudiante si no es el propio estudiante viendo sus datos */}
                  {user?.rol !== 'estudiante' && (
                    <>
                      <td>{i.estudiante_nombre || i.usuario_nombre || 'Sin nombre'}</td>
                      <td>{i.estudiante_matricula || 'N/A'}</td>
                    </>
                  )}
                  <td>{i.tipo || 'Sin tipo'}</td>
                  <td>{i.descripcion}</td>
                  <td>{i.fecha}</td>
                  <td>
                    {i.materia_nombre && <span>📚 {i.materia_nombre}</span>}
                    {i.taller_nombre && <span>🎨 {i.taller_nombre}</span>}
                    {!i.materia_nombre && !i.taller_nombre && 'N/A'}
                  </td>
                  <td>{i.sancion || 'Sin sanción'}</td>
                  {/* Solo admin y docente pueden editar */}
                  {(user?.rol === 'admin' || user?.rol === 'docente') && (
                    <td>
                      <button onClick={() => handleEditar(i)} title="Editar">✏️</button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Modal solo para admin/docente */}
      {(user?.rol === 'admin' || user?.rol === 'docente') && modalIncidencia && (
        <IncidenciaModal
          incidencia={modalIncidencia}
          onSave={handleSave}
          onClose={() => setModalIncidencia(null)}
        />      )}
      </div>
    </Layout>
  );
}

export default IncidenciasList;
