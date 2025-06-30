import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useNotification } from '../NotificationContext';
import ThemeToggle from './ThemeToggle';
import PasswordChangeModal from './PasswordChangeModal';
import './Login.css';

function Login() {
  const [loginInput, setLoginInput] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);
  const [tempPasswordExpires, setTempPasswordExpires] = useState(null);
  const [tempToken, setTempToken] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showNotification } = useNotification();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('http://localhost:3001/api/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: loginInput, contrasena })
      });
      const data = await response.json();
      
      if (response.ok && data.token) {
        // Verificar si requiere cambio de contraseña
        if (data.passwordChangeRequired) {
          // ✅ CRUCIAL: Guardar el token ANTES de mostrar el modal
          // Sin esto, el modal no puede hacer peticiones autenticadas
          login(data.token);
          
          // Mostrar modal de cambio de contraseña
          setTempToken(data.token);
          setTempPasswordExpires(data.tempPasswordExpires);
          setShowPasswordChangeModal(true);
          showNotification(data.message || 'Debe cambiar su contraseña temporal', 'warning');
          return;
        }
        
        // Login normal
        if (data.estudiantes && Array.isArray(data.estudiantes)) {
          // Guardar el primer estudiante seleccionado por defecto
          login(data.token, {
            estudiantes: data.estudiantes,
            estudianteSeleccionado: data.estudiantes[0] || null
          });
        } else {
          login(data.token);
        }
        navigate('/dashboard');
      } else {
        // Manejar errores específicos
        if (data.expired) {
          setError('Su contraseña temporal ha expirado. Contacte al administrador para reactivar su cuenta.');
        } else {
          setError(`Error ${response.status}: ${data.error || 'Error de autenticación'}`);
        }
      }
    } catch (err) {
      setError('Error de red o servidor: ' + err.message);
    }
  };

  const handlePasswordChangeSuccess = (success) => {
    if (success) {
      setShowPasswordChangeModal(false);
      setTempToken(null);
      setTempPasswordExpires(null);
      
      // Limpiar formulario y mostrar mensaje
      setLoginInput('');
      setContrasena('');
      showNotification('Contraseña actualizada correctamente. Puede iniciar sesión con su nueva contraseña.', 'success');
      
      // Opcional: hacer login automático con el token actualizado
      // En este caso, mejor pedimos que vuelvan a hacer login
    } else {
      setShowPasswordChangeModal(false);
      setTempToken(null);
      setTempPasswordExpires(null);
    }
  };  return (
    <>
      <div className="login-bg-modern">
        <div className="theme-toggle-login">
          <ThemeToggle />
        </div>
        <div className="login-container-modern">
          <div className="login-header-modern">
            <div className="logo">🎓</div>
            <h2>Sistema Escolar</h2>
            <p className="login-subtitle-modern">Accede a tu panel de control</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group-modern">
              <label>Usuario o correo:</label>
              <input type="text" value={loginInput} onChange={e => setLoginInput(e.target.value)} required />
            </div>
            <div className="form-group-modern">
              <label>Contraseña:</label>
              <input type="password" value={contrasena} onChange={e => setContrasena(e.target.value)} required />
            </div>
            {error && <div className="error-modern">{error}</div>}
            <button type="submit">Iniciar Sesión</button>
          </form>
        </div>
      </div>
      
      {/* Modal para cambio de contraseña temporal */}
      <PasswordChangeModal
        isOpen={showPasswordChangeModal}
        onClose={handlePasswordChangeSuccess}
        tempPasswordExpires={tempPasswordExpires}
      />
    </>
  );
}

export default Login;
