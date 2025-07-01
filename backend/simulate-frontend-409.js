const https = require('https');
const http = require('http');

function makeRequest(url, options, data) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;
    const req = protocol.request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            json: () => Promise.resolve(JSON.parse(body))
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            json: () => Promise.resolve(body)
          });
        }
      });
    });
    
    req.on('error', reject);
    
    if (data) {
      req.write(data);
    }
    req.end();
  });
}

async function simulateFrontendRequest() {
  try {
    console.log('=== SIMULANDO REQUEST DEL FRONTEND ===');
    
    // Simular datos que podría enviar el frontend
    const testData = {
      nombre: 'Nuevo Estudiante Test',
      correo: 'nuevo.estudiante@escuela.com',
      contrasena: 'password123',
      rol: 'estudiante',
      matricula: 'C1111111111111',
      grupo: '1',
      anio: '2'
    };
    
    console.log('Enviando datos:', JSON.stringify(testData, null, 2));
    
    const response = await makeRequest('http://localhost:3001/api/usuarios', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, JSON.stringify(testData));
    
    const result = await response.json();
    
    console.log('\n=== RESPUESTA ===');
    console.log('Status:', response.status);
    console.log('Body:', JSON.stringify(result, null, 2));
    
    if (response.status === 409) {
      console.log('\n❌ Error 409 detectado!');
      if (result.detalles) {
        console.log('Detalles del conflicto:', result.detalles);
      }
    } else if (response.status === 201) {
      console.log('\n✅ Usuario creado exitosamente!');
    } else {
      console.log('\n⚠️ Respuesta inesperada');
    }
    
  } catch (error) {
    console.error('Error en la simulación:', error.message);
  }
}

simulateFrontendRequest();
