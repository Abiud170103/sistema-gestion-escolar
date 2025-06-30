import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <b>Gestión Escolar</b>
        <button className="navbar-hamburger" onClick={() => setMenuOpen(m => !m)} aria-label="Menú">
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>
        <div className={`navbar-links${menuOpen ? ' open' : ''}`}>
          <Link to="/dashboard" onClick={() => setMenuOpen(false)}>Inicio</Link>
          {user?.rol === 'admin' && <Link to="/usuarios" onClick={() => setMenuOpen(false)}>Usuarios</Link>}
          <Link to="/calificaciones" onClick={() => setMenuOpen(false)}>Calificaciones</Link>
          <Link to="/asistencias" onClick={() => setMenuOpen(false)}>Asistencias</Link>
          {user?.rol !== 'padre' && <Link to="/talleres" onClick={() => setMenuOpen(false)}>Talleres</Link>}
          <Link to="/incidencias" onClick={() => setMenuOpen(false)}>Incidencias</Link>
          <Link to="/horarios" onClick={() => setMenuOpen(false)}>Horarios</Link>
        </div>
      </div>
      <div className="navbar-user">
        <span style={{marginRight:15}}>
          {user?.nombre || 'Usuario'} ({user?.rol})
        </span>
        <button onClick={handleLogout}>Cerrar sesión</button>
      </div>
    </nav>
  );
}

export default Navbar;
