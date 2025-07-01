const express = require('express');
const cors = require('cors');

// Crear un servidor de interceptación temporal
const app = express();
app.use(cors());
app.use(express.json());

// Middleware para logear todo lo que llega
app.use((req, res, next) => {
    console.log('\n🔍 INTERCEPTANDO PETICIÓN DEL FRONTEND:');
    console.log('📅 Timestamp:', new Date().toISOString());
    console.log('🌐 Method:', req.method);
    console.log('📍 URL:', req.url);
    console.log('📋 Headers:', JSON.stringify(req.headers, null, 2));
    console.log('📦 Body:', JSON.stringify(req.body, null, 2));
    console.log('=' .repeat(50));
    next();
});

// Interceptar peticiones POST a /api/usuarios
app.post('/api/usuarios', (req, res) => {
    console.log('\n✅ PETICIÓN INTERCEPTADA - ANÁLISIS DETALLADO:');
    
    const body = req.body;
    
    console.log('📝 Datos recibidos:');
    Object.keys(body).forEach(key => {
        const value = body[key];
        const type = typeof value;
        const isEmpty = value === '' || value === null || value === undefined;
        console.log(`   ${key}: "${value}" (tipo: ${type}, vacío: ${isEmpty})`);
    });
    
    console.log('\n🔍 Validaciones:');
    console.log(`   ✅ Nombre presente: ${!!body.nombre}`);
    console.log(`   ✅ Correo presente: ${!!body.correo}`);
    console.log(`   ✅ Password presente: ${!!(body.password || body.contrasena)}`);
    console.log(`   ✅ Rol presente: ${!!body.rol}`);
    
    console.log('\n📧 Análisis del correo:');
    if (body.correo) {
        const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
        console.log(`   📧 Correo: ${body.correo}`);
        console.log(`   ✅ Formato válido: ${emailRegex.test(body.correo)}`);
        console.log(`   🏷️ Dominio: ${body.correo.split('@')[1] || 'N/A'}`);
    }
    
    console.log('\n👤 Análisis del usuario:');
    console.log(`   👤 Usuario enviado: "${body.usuario}"`);
    console.log(`   🔄 Necesita generación automática: ${!body.usuario || body.usuario.trim() === ''}`);
    
    // Simular respuesta exitosa
    const responseData = {
        success: true,
        message: 'Datos interceptados correctamente',
        receivedData: body,
        timestamp: new Date().toISOString()
    };
    
    console.log('\n📤 Enviando respuesta simulada...');
    res.status(200).json(responseData);
});

// Interceptar cualquier otra petición
app.use('*', (req, res) => {
    console.log(`\n⚠️  Petición no esperada: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ error: 'Endpoint no encontrado en interceptor' });
});

const PORT = 3002; // Puerto diferente para no interferir
app.listen(PORT, () => {
    console.log(`🔍 SERVIDOR INTERCEPTOR corriendo en puerto ${PORT}`);
    console.log(`📍 Para interceptar peticiones del frontend:`);
    console.log(`   1. Cambia temporalmente la URL del frontend de:`);
    console.log(`      http://localhost:3001 → http://localhost:3002`);
    console.log(`   2. Intenta registrar un usuario`);
    console.log(`   3. Revisa los logs aquí`);
    console.log(`   4. Luego cambia de vuelta a 3001`);
    console.log('=' .repeat(50));
});

// Manejar errores
app.on('error', (error) => {
    console.error('❌ Error en servidor interceptor:', error);
});

process.on('SIGINT', () => {
    console.log('\n👋 Cerrando servidor interceptor...');
    process.exit(0);
});
