// Servicio centralizado para peticiones a la API protegidas con JWT
import { useAuth } from './AuthContext';

const API_URL = 'http://localhost:3001/api';

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Token no proporcionado');
  }
  
  console.log(`=== API REQUEST DEBUG ===`);
  console.log(`Endpoint: ${endpoint}`);
  console.log(`Method: ${options.method || 'GET'}`);
  if (options.body) {
    console.log(`Body:`, JSON.parse(options.body));
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
  
  console.log(`Response Status: ${response.status}`);
  console.log(`Response Data:`, data);
  
  if (!response.ok) {
    if (response.status === 401) {
      // Si el token expiró, cerrar sesión globalmente
      if (window.logoutFromApi) window.logoutFromApi();
    }
    
    // Incluye más detalles del error
    let msg = data.error || 'Error en la petición';
    if (data.detalle) msg += `: ${data.detalle}`;
    if (data.detalles && Array.isArray(data.detalles)) {
      msg += `\nDetalles: ${data.detalles.join(', ')}`;
    }
    
    console.error(`API Error:`, { status: response.status, error: msg, data });
    throw new Error(msg);
  }
  return data;
}
