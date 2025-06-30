import React from 'react';
import { useAuth } from '../AuthContext';

/**
 * Componente de debug para verificar el estado de autenticación
 * Solo para desarrollo - mostrar información del token y usuario
 */
function AuthDebug() {
  const { user, isAuthenticated } = useAuth();
  const token = localStorage.getItem('token');
  
  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV === 'production') {
    return null;
  }
  
  return (
    <div style={{
      position: 'fixed',
      top: 10,
      right: 10,
      background: '#000',
      color: '#0f0',
      padding: 10,
      fontSize: 12,
      fontFamily: 'monospace',
      borderRadius: 5,
      zIndex: 9999,
      maxWidth: 300,
      border: '1px solid #333'
    }}>
      <div><strong>🔍 AUTH DEBUG</strong></div>
      <div>Authenticated: {isAuthenticated ? '✅' : '❌'}</div>
      <div>Token: {token ? `✅ (${token.length} chars)` : '❌ None'}</div>
      <div>User ID: {user?.id_usuario || 'None'}</div>
      <div>Role: {user?.rol || 'None'}</div>
      <div>Name: {user?.nombre || 'None'}</div>
      <div>Email: {user?.correo || 'None'}</div>
      {user?.password_change_required && (
        <div style={{color: '#ff0'}}>⚠️ Password change required</div>
      )}
      {user?.temp_password_expires && (
        <div style={{color: '#ff0'}}>
          ⏰ Temp expires: {new Date(user.temp_password_expires).toLocaleString()}
        </div>
      )}
      <div style={{marginTop: 5, fontSize: 10, color: '#666'}}>
        localStorage keys: {Object.keys(localStorage).join(', ')}
      </div>
    </div>
  );
}

export default AuthDebug;
