import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import ThemeToggle from './ThemeToggle';
import Layout from './Layout';
import './Dashboard.css';

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(
    user?.estudiantes?.[0]?.id_usuario || null
  );

  // Mapear el rol a un nombre amigable
  const rolMap = {
    admin: 'Administrador',
    docente: 'Docente',
    estudiante: 'Estudiante',
    padre: 'Padre/Tutor',
  };
  const nombre = user?.nombre || '';
  const rol = user?.rol ? rolMap[user.rol] || user.rol : '';

  // Función para manejar la navegación
  const handleModuleClick = (moduleTitle) => {
    switch (moduleTitle) {
      case 'Gestión de Usuarios':
        navigate('/usuarios');
        break;
      case 'Calificaciones':
      case 'Mis Calificaciones':
        navigate('/calificaciones');
        break;
      case 'Asistencia':
      case 'Mi Asistencia':
        navigate('/asistencias');
        break;
      case 'Talleres':
        navigate('/talleres');
        break;
      case 'Incidencias':
      case 'Mis Incidencias':
        navigate('/incidencias');
        break;
      case 'Horarios':
      case 'Mis Materias':
        navigate('/horarios');
        break;
      default:
        console.log(`Navegación para ${moduleTitle} no implementada aún`);
    }
  };

  // Definir módulos según el rol
  const getModulesByRole = (userRole) => {
    const modules = {
      admin: [
        { title: 'Gestión de Usuarios', description: 'Administrar docentes, estudiantes y padres', icon: '👥' },
        { title: 'Calificaciones', description: 'Gestionar calificaciones del sistema', icon: '📊' },
        { title: 'Asistencia', description: 'Control de asistencia general', icon: '✓' },
        { title: 'Talleres', description: 'Administrar talleres y actividades', icon: '🎨' },
        { title: 'Incidencias', description: 'Gestionar reportes e incidencias', icon: '⚠️' },
        { title: 'Horarios', description: 'Administrar horarios académicos', icon: '📅' }
      ],
      docente: [
        { title: 'Mis Materias', description: 'Gestionar mis asignaturas y grupos', icon: '📝' },
        { title: 'Calificaciones', description: 'Registro y seguimiento de notas', icon: '📋' },
        { title: 'Asistencia', description: 'Control de asistencia estudiantil', icon: '✓' },
        { title: 'Horarios', description: 'Ver mi horario de clases', icon: '📅' },
        { title: 'Incidencias', description: 'Reportar y gestionar incidencias', icon: '⚠️' },
        { title: 'Talleres', description: 'Ver alumnos inscritos en talleres', icon: '🎨' }
      ],
      estudiante: [
        { title: 'Mis Materias', description: 'Ver horarios y asignaturas', icon: '📚' },
        { title: 'Mis Calificaciones', description: 'Consultar notas y evaluaciones', icon: '📊' },
        { title: 'Mi Asistencia', description: 'Revisar mi historial de asistencia', icon: '✓' },
        { title: 'Mis Incidencias', description: 'Ver mis reportes y comunicaciones', icon: '⚠️' },
        { title: 'Talleres', description: 'Ver talleres disponibles e inscritos', icon: '🎨' }
      ],
      padre: [
        { title: 'Calificaciones', description: 'Seguimiento del rendimiento académico', icon: '📊' },
        { title: 'Asistencia', description: 'Historial de asistencia de mi hijo/a', icon: '✓' },
        { title: 'Incidencias', description: 'Reportes y comunicaciones escolares', icon: '⚠️' },
        { title: 'Horarios', description: 'Horarios y calendario académico', icon: '📅' }
      ]
    };
    return modules[userRole] || [];
  };

  const userModules = getModulesByRole(user?.rol);

  return (
    <Layout title="Panel de Control" showBackButton={false}>
      <div className="dashboard-container">
        {/* Welcome Section */}
        <section className="welcome-section">
          <h2>Bienvenido, {nombre}</h2>
          <p>Accede a las herramientas disponibles para tu perfil de {rol}</p>
          
          {/* Selector de estudiante para padres con más de un hijo */}
          {user?.rol === 'padre' && user.estudiantes && user.estudiantes.length > 1 && (
            <div className="student-selector">
              <label>Selecciona estudiante: </label>
              <select 
                value={estudianteSeleccionado || ''} 
                onChange={e => setEstudianteSeleccionado(Number(e.target.value))}
              >
                {user.estudiantes.map(est => (
                  <option key={est.id_usuario} value={est.id_usuario}>{est.nombre}</option>
                ))}
              </select>
            </div>
          )}
        </section>

        {/* Modules Grid */}
        <section className="modules-section">
          <div className="modules-grid">
            {userModules.map((module, index) => (
              <div key={index} className="module-card">
                <div className="module-icon">{module.icon}</div>
                <h3 className="module-title">{module.title}</h3>
                <p className="module-description">{module.description}</p>
                <button 
                  className="module-btn"
                  onClick={() => handleModuleClick(module.title)}
                >
                  Acceder
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Stats */}
        <section className="stats-section">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">156</div>
              <div className="stat-label">Estudiantes Activos</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">24</div>
              <div className="stat-label">Docentes</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">12</div>
              <div className="stat-label">Asignaturas</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">95%</div>
              <div className="stat-label">Asistencia Promedio</div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}

export default Dashboard;
