import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

function parseJwt(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // Refuerza: asegura que siempre haya rol, id_usuario y nombre
    return {
      id_usuario: payload.id_usuario || null,
      rol: payload.rol || null,
      nombre: payload.nombre || '',
      correo: payload.correo || '',
      ...payload
    };
  } catch {
    return {};
  }
}

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    if (token) {
      setUser(parseJwt(token));
    } else {
      setUser(null);
    }
    // Permitir que apiRequest cierre sesión globalmente
    window.logoutFromApi = () => logout();
    return () => { window.logoutFromApi = null; };
  }, []);

  const login = (token) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
    setUser(parseJwt(token));
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
