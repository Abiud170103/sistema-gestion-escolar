import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import UsuariosList from './components/UsuariosList';
import CalificacionesList from './components/CalificacionesList';
import AsistenciasList from './components/AsistenciasList';
import TalleresList from './components/TalleresList';
import IncidenciasList from './components/IncidenciasList';
import HorariosList from './components/HorariosList';
import { AuthProvider, useAuth } from './AuthContext';
import { ThemeProvider } from './ThemeContext';
import './App.css';
import './estilos-institucionales.css';
import './components/ComponentStyles.css';
import { NotificationProvider } from './NotificationContext';
import Bienvenida from './components/Bienvenida';

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const handleLoginClick = () => setShowLogin(true);

  // Si no está autenticado, mostrar bienvenida o login
  if (!isAuthenticated) {
    return !showLogin ? (
      <Bienvenida onLogin={handleLoginClick} />
    ) : (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  // Si está autenticado, mostrar el resto de rutas protegidas
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/usuarios" element={<UsuariosList />} />
      <Route path="/calificaciones" element={<CalificacionesList />} />
      <Route path="/asistencias" element={<AsistenciasList />} />
      <Route path="/talleres" element={<TalleresList />} />
      <Route path="/incidencias" element={<IncidenciasList />} />
      <Route path="/horarios" element={<HorariosList />} />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <AppRoutes />
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
