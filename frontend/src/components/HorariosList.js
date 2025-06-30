import React, { useEffect, useState } from 'react';
import { apiRequest } from '../api';
import { useAuth } from '../AuthContext';
import Layout from './Layout';

function HorariosList() {
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
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
    async function fetchHorarios() {
      try {
        let endpoint = '/horarios';
        if (user?.rol === 'estudiante') endpoint = '/horarios/mio';
        if (user?.rol === 'docente') endpoint = '/horarios/docente';
        if (user?.rol === 'padre') endpoint = `/horarios/estudiante/${estudianteSeleccionado}`;
        const data = await apiRequest(endpoint, { method: 'GET' });
        setHorarios(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchHorarios();
  }, [user, estudianteSeleccionado]);

  // Agrupar horarios por año y luego por turno (A/B)
  function agruparPorAnioYTurno(horarios) {
    const grupos = {};
    horarios.forEach(h => {
      const anio = h.grupo_anio || 'Sin año';
      const turno = h.grupo_turno || 'Sin turno';
      
      if (!grupos[anio]) {
        grupos[anio] = {};
      }
      if (!grupos[anio][turno]) {
        grupos[anio][turno] = [];
      }
      grupos[anio][turno].push(h);
    });
    return grupos;
  }

  const horariosPorAnioYTurno = agruparPorAnioYTurno(horarios);

  if (loading) return <div>Cargando horarios...</div>;
  if (error) return <div style={{color:'red'}}>Error: {error}</div>;
  return (
    <Layout title="Horarios">
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
      <div style={{overflowX:'auto'}}>
        {Object.keys(horariosPorAnioYTurno).sort().map(anio => (
          <div key={anio} style={{marginBottom:32}}>
            <h2 style={{marginTop:24, marginBottom:16, color:'#333', borderBottom:'2px solid #ddd', paddingBottom:8}}>
              {anio === 'Sin año' ? 'Sin año definido' : `${anio}° Año`}
            </h2>
            {Object.keys(horariosPorAnioYTurno[anio]).sort().map(turno => (
              horariosPorAnioYTurno[anio][turno].length > 0 && (
                <div key={`${anio}-${turno}`} style={{marginBottom:24, marginLeft:16}}>
                  <h3 style={{marginTop:16, marginBottom:8, color:'#555'}}>
                    Turno {turno === 'Sin turno' ? 'No definido' : turno}
                  </h3>
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Grupo</th>
                        <th>Materia</th>
                        <th>Docente</th>
                        <th>Día</th>
                        <th>Hora inicio</th>
                        <th>Hora fin</th>
                      </tr>
                    </thead>
                    <tbody>
                      {horariosPorAnioYTurno[anio][turno].map(h => (
                        <tr key={h.id || h.id_horario}>
                          <td>{h.id || h.id_horario}</td>
                          <td>{h.grupo_anio && h.grupo_turno ? `${h.grupo_anio}° ${h.grupo_turno}` : (h.grupo_nombre || h.taller_nombre || h.grupo_id || 'Sin grupo/taller')}</td>
                          <td>{h.materia_nombre || h.materia || h.materiaId || 'Sin materia'}</td>
                          <td>{h.docente_nombre || h.docenteId || 'Sin docente'}</td>
                          <td>{h.dia}</td>
                          <td>{h.hora_inicio}</td>
                          <td>{h.hora_fin}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ))}
          </div>
        ))}
      </div>
      </div>
    </Layout>
  );
}

export default HorariosList;
