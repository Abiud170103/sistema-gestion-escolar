import React, { useState } from 'react';
import './Modal.css';
import { useAuth } from '../AuthContext';
import { useNotification } from '../NotificationContext';
import { apiRequest } from '../api';

function PasswordChangeModal({ isOpen, onClose, tempPasswordExpires }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showNotification } = useNotification();
  const { user } = useAuth();

  const formatDateTime = (dateString) => {
    try {
      return new Date(dateString).toLocaleString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Fecha no disponible';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!newPassword) {
      setError('La nueva contraseña es requerida');
      return;
    }
    
    if (newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    setLoading(true);
    
    try {
      // Verificar que existe el token antes de hacer la petición
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('❌ No hay token disponible');
        setError('No está autenticado. Por favor, vuelva a iniciar sesión.');
        return;
      }
      
      const data = await apiRequest('/usuarios/cambiar-password-temporal', {
        method: 'POST',
        body: JSON.stringify({
          nuevaContrasena: newPassword
        })
      });

      console.log('✅ Contraseña cambiada exitosamente');
      showNotification('Contraseña actualizada correctamente', 'success');
      onClose(true); // true indica que el cambio fue exitoso
      
    } catch (err) {
      console.error('❌ Error al cambiar contraseña:', err.message);
      
      // Manejo específico de errores
      if (err.message.includes('Token no proporcionado')) {
        setError('No está autenticado. Por favor, vuelva a iniciar sesión.');
      } else if (err.message.includes('Token inválido')) {
        setError('Su sesión ha expirado. Por favor, vuelva a iniciar sesión.');
      } else if (err.message.includes('expirado')) {
        setError('Su contraseña temporal ha expirado. Contacte al administrador.');
      } else {
        setError(err.message || 'Error al cambiar la contraseña');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-bg">
      <div className="modal-form" style={{ maxWidth: 500 }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <h2 style={{ color: '#e74c3c', marginBottom: 10 }}>🔒 Cambio de Contraseña Requerido</h2>
          <p style={{ color: '#666', fontSize: 14 }}>
            Debe cambiar su contraseña temporal antes de continuar
          </p>
          {tempPasswordExpires && (
            <div style={{ 
              backgroundColor: '#fff3cd', 
              padding: 12, 
              borderRadius: 6, 
              border: '1px solid #ffeaa7',
              marginTop: 15,
              fontSize: 14
            }}>
              <strong>⏰ Su contraseña temporal expira el:</strong><br />
              {formatDateTime(tempPasswordExpires)}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="newPassword">Nueva Contraseña *</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Nueva Contraseña *</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirme su nueva contraseña"
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div style={{ 
              color: '#e74c3c', 
              backgroundColor: '#fdebea', 
              padding: 10, 
              borderRadius: 4, 
              marginBottom: 15,
              fontSize: 14,
              border: '1px solid #f5b7b1'
            }}>
              {error}
            </div>
          )}

          <div style={{ 
            backgroundColor: '#e8f4fd', 
            padding: 15, 
            borderRadius: 6, 
            marginBottom: 20,
            fontSize: 14,
            border: '1px solid #bee5eb'
          }}>
            <strong>💡 Consejos para una contraseña segura:</strong>
            <ul style={{ margin: '8px 0 0 20px', paddingLeft: 0 }}>
              <li>Al menos 8 caracteres</li>
              <li>Combine letras mayúsculas y minúsculas</li>
              <li>Incluya números y símbolos</li>
              <li>No use información personal</li>
            </ul>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: loading ? '#95a5a6' : '#27ae60',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: 6,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: 14,
                fontWeight: 'bold'
              }}
            >
              {loading ? '🔄 Cambiando...' : '✅ Cambiar Contraseña'}
            </button>
          </div>
        </form>

        <div style={{ 
          textAlign: 'center', 
          marginTop: 20, 
          fontSize: 12, 
          color: '#666' 
        }}>
          <p>
            <strong>Nota:</strong> Una vez cambiada su contraseña, podrá acceder normalmente al sistema.
          </p>
        </div>
      </div>
    </div>
  );
}

export default PasswordChangeModal;
