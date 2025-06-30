import React, { useEffect, useState } from 'react';
import { apiRequest } from '../api';
import { useAuth } from '../AuthContext';
import { useNotification } from '../NotificationContext';
import Layout from './Layout';
import './ComponentStyles.css';

function TalleresList() {
  const [talleres, setTalleres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const [inscribiendo, setInscribiendo] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [tallerActualId, setTallerActualId] = useState(null);
  const [fechaInscripcion, setFechaInscripcion] = useState(null);
  const { showNotification } = useNotification();
  const [success, setSuccess] = useState('');
  const [localError, setLocalError] = useState('');
  const [alumnosModal, setAlumnosModal] = useState({ open: false, taller: null, alumnos: [] });

  useEffect(() => {
    async function fetchTalleres() {
      try {
        const data = await apiRequest('/talleres', { method: 'GET' });
        setTalleres(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchTalleres();
  }, []);

  useEffect(() => {
    async function fetchTallerActual() {
      if (user?.rol === 'estudiante') {
        try {
          const data = await apiRequest('/talleres/mi-taller', { method: 'GET' });
          setTallerActualId(data?.id || null);
          setFechaInscripcion(data?.fecha_inscripcion || null);
        } catch {
          setTallerActualId(null);
          setFechaInscripcion(null);
        }
      }
    }
    fetchTallerActual();
  }, [user]);

  useEffect(() => {
    if (success || localError) {
      const timer = setTimeout(() => {
        setSuccess('');
        setLocalError('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, localError]);

  const handleInscribir = async (tallerId) => {
    setInscribiendo(true);
    setMensaje('');
    setSuccess('');
    setLocalError('');
    try {
      await apiRequest(`/talleres/${tallerId}/inscribir`, { method: 'POST' });
      setMensaje('Inscripción exitosa');
      setSuccess('Inscripción exitosa');
      showNotification('Inscripción exitosa', 'success');
      // Refrescar talleres
      const data = await apiRequest('/talleres', { method: 'GET' });
      setTalleres(data);
    } catch (err) {
      setMensaje(err.message);
      setLocalError(err.message);
      showNotification(err.message, 'error');
    } finally {
      setInscribiendo(false);
    }
  };

  const handleCambioTaller = async (nuevoTallerId) => {
    setInscribiendo(true);
    setMensaje('');
    setSuccess('');
    setLocalError('');
    try {
      await apiRequest(`/talleres/${nuevoTallerId}/cambiar`, { method: 'POST' });
      setMensaje('Cambio de taller exitoso');
      setSuccess('Cambio de taller exitoso');
      setTallerActualId(nuevoTallerId);
      showNotification('Cambio de taller exitoso', 'success');
      const data = await apiRequest('/talleres', { method: 'GET' });
      setTalleres(data);
    } catch (err) {
      setMensaje(err.message);
      setLocalError(err.message);
      showNotification(err.message, 'error');
    } finally {
      setInscribiendo(false);
    }
  };

  const handleVerAlumnos = async (taller) => {
    try {
      const alumnos = await apiRequest(`/talleres/${taller.id}/alumnos`, { method: 'GET' });
      setAlumnosModal({ open: true, taller, alumnos });
    } catch (err) {
      setLocalError(err?.message || (err?.detalle ? err.detalle : 'No se pudieron obtener los alumnos'));
    }
  };

  const closeAlumnosModal = () => setAlumnosModal({ open: false, taller: null, alumnos: [] });

  const handleDarDeBaja = async (tallerId, estudianteId, estudianteNombre) => {
    if (!window.confirm(`¿Está seguro de que desea dar de baja a ${estudianteNombre} del taller?`)) {
      return;
    }
    
    try {
      const response = await apiRequest(`/talleres/${tallerId}/estudiante/${estudianteId}`, { 
        method: 'DELETE' 
      });
      
      showNotification(`${estudianteNombre} ha sido dado de baja del taller exitosamente`, 'success');
      setSuccess(`${estudianteNombre} ha sido dado de baja del taller exitosamente`);
      
      // Actualizar la lista de alumnos en el modal
      const alumnosActualizados = await apiRequest(`/talleres/${tallerId}/alumnos`, { method: 'GET' });
      setAlumnosModal(prev => ({ ...prev, alumnos: alumnosActualizados }));
      
      // Actualizar la lista de talleres para reflejar el cambio en el conteo
      const talleresActualizados = await apiRequest('/talleres', { method: 'GET' });
      setTalleres(talleresActualizados);
      
    } catch (err) {
      const errorMsg = err.message || 'Error al dar de baja al estudiante';
      showNotification(errorMsg, 'error');
      setLocalError(errorMsg);
    }
  };

  function puedeCambiarTaller(t) {
    if (!tallerActualId || tallerActualId === t.id) return false;
    if (t.inscritos >= t.cupo_maximo) return false;
    if (!fechaInscripcion) return false;
    const fecha = new Date(fechaInscripcion);
    const ahora = new Date();
    const diffDias = (ahora - fecha) / (1000 * 60 * 60 * 24);
    return diffDias <= 7;
  }

  if (loading) return <div>Cargando talleres...</div>;
  if (error) return <div style={{color:'red'}}>Error: {error}</div>;
  return (
    <Layout title="Talleres">
      <div>
        {success && <div style={{color:'green', marginBottom:8}}>{success}</div>}
        {localError && <div style={{color:'red', marginBottom:8}}>{localError}</div>}
      <div style={{overflowX:'auto'}}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Cupo</th>
              <th>Inscritos</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {talleres.map(t => (
              <tr key={t.id}>
                <td>{t.id}</td>
                <td>{t.nombre}</td>
                <td>{t.cupo_maximo}</td>
                <td>{t.inscritos || 0}</td>
                <td>
                  <button onClick={() => handleVerAlumnos(t)} style={{marginRight:8}}>Ver alumnos</button>
                  {user?.rol === 'estudiante' && (
                    tallerActualId === t.id ? (
                      <span style={{color:'green'}}>Inscrito</span>
                    ) : (
                      <button
                        onClick={() => tallerActualId ? handleCambioTaller(t.id) : handleInscribir(t.id)}
                        disabled={inscribiendo || (t.inscritos >= t.cupo_maximo) || (tallerActualId && !puedeCambiarTaller(t))}
                        title={tallerActualId ? 'Cambiar a este taller' : 'Inscribirse'}
                      >
                        {t.inscritos >= t.cupo_maximo ? 'Cupo lleno' : tallerActualId ? '🔄 Cambiar' : '➕ Inscribirse'}
                      </button>
                    )
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {alumnosModal.open && (
        <div className="modal-bg">
          <div className="modal-form" style={{maxWidth:500}}>
            <h3>Alumnos inscritos en {alumnosModal.taller.nombre}</h3>
            <button onClick={closeAlumnosModal} style={{float:'right'}}>Cerrar</button>
            <table className="alumnos-modal-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Matrícula</th>
                  <th>Grupo</th>
                  {user?.rol === 'admin' && <th>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {alumnosModal.alumnos.length === 0 ? (
                  <tr><td colSpan={user?.rol === 'admin' ? 6 : 5} style={{textAlign:'center'}}>Sin alumnos inscritos</td></tr>
                ) : (
                  alumnosModal.alumnos.map(a => (
                    <tr key={a.id_usuario}>
                      <td>{a.id_usuario}</td>
                      <td>{a.nombre}</td>
                      <td>{a.correo}</td>
                      <td>{a.matricula}</td>
                      <td>{a.grupo_id}</td>
                      {user?.rol === 'admin' && (
                        <td>
                          <button
                            className="btn-dar-baja"
                            onClick={() => handleDarDeBaja(alumnosModal.taller.id, a.id_usuario, a.nombre)}
                            title={`Dar de baja a ${a.nombre}`}
                          >
                            🗑️ Dar de baja
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>        </div>
      )}
      </div>
    </Layout>
  );
}

export default TalleresList;
