// Servicio centralizado para peticiones a la API protegidas con JWT
import { useAuth } from './AuthContext';

const API_URL = 'http://localhost:3001/api';

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Token no proporcionado');
  }
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) }
  });
  
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) {
      // Si el token expiró, cerrar sesión globalmente
      if (window.logoutFromApi) window.logoutFromApi();
    }
    // Incluye el detalle si existe
    let msg = data.error || 'Error en la petición';
    if (data.detalle) msg += `: ${data.detalle}`;
    throw new Error(msg);
  }
  return data;
}
