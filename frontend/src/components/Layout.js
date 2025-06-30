import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import ThemeToggle from './ThemeToggle';
import './Layout.css';

function Layout({ children, title, showBackButton = true }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  // Mapear el rol a un nombre amigable
  const rolMap = {
    admin: 'Administrador',
    docente: 'Docente',
    estudiante: 'Estudiante',
    padre: 'Padre/Tutor',
  };

  const nombre = user?.nombre || '';
  const rol = user?.rol ? rolMap[user.rol] || user.rol : '';

  return (
    <div className="layout-container">
      {/* Header profesional */}
      <header className="layout-header">
        <div className="layout-header-left">
          <div className="layout-logo">
            <span className="layout-logo-icon">🎓</span>
            <div className="layout-logo-text">
              <h1>Sistema Escolar</h1>
              <span className="layout-subtitle">Gestión Académica</span>
            </div>
          </div>
        </div>
        
        <div className="layout-header-center">
          {title && <h2 className="layout-page-title">{title}</h2>}
        </div>        <div className="layout-header-right">
          <div className="layout-user-info">
            <div className="layout-user-details">
              <span className="layout-user-name">{nombre}</span>
              <span className="layout-user-role">{rol}</span>
            </div>
            <div className="layout-user-avatar">
              {nombre.charAt(0).toUpperCase()}
            </div>
          </div>
          <ThemeToggle />
          <button 
            className="layout-logout-btn"
            onClick={handleLogout}
            title="Cerrar sesión"
          >
            ⚪
          </button>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="layout-main">
        {showBackButton && (
          <div className="layout-back-section">
            <button 
              className="layout-back-btn"
              onClick={handleBackToDashboard}
            >
              ← Volver al Panel Principal
            </button>
          </div>
        )}
        
        <div className="layout-content">
          {children}
        </div>
      </main>
    </div>
  );
}

export default Layout;
