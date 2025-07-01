const axios = require('axios');

async function testSimpleStudentCreation() {
    console.log('🔍 Debuggeando inserción de estudiante...');
    
    // Test muy simple sin campos extras
    const estudianteSimple = {
        nombre: 'Test Student',
        usuario: '',
        correo: `test.student.${Date.now()}@test.com`,
        contrasena: 'password123',
        rol: 'estudiante'
        // SIN matricula, grupo, anio para ver si funciona lo básico
    };

    console.log('\n📋 Test 1: Solo campos básicos (sin matricula/grupo/anio)');
    try {
        const response = await axios.post('http://localhost:3001/api/usuarios', estudianteSimple);
        console.log('✅ Éxito con campos básicos:', response.data.usuario);
    } catch (error) {
        console.log('❌ Error con campos básicos:', error.response?.data);
        return; // Si falla lo básico, no continuar
    }

    // Test con matricula pero sin grupo/anio
    const estudianteConMatricula = {
        nombre: 'Test Student 2',
        usuario: '',
        correo: `test.student2.${Date.now()}@test.com`,
        contrasena: 'password123',
        rol: 'estudiante',
        matricula: 'C1234567890123'
        // SIN grupo, anio
    };

    console.log('\n📋 Test 2: Con matrícula, sin grupo/año');
    try {
        const response = await axios.post('http://localhost:3001/api/usuarios', estudianteConMatricula);
        console.log('✅ Éxito con matrícula:', response.data.usuario);
    } catch (error) {
        console.log('❌ Error con matrícula:', error.response?.data);
    }

    // Test completo
    const estudianteCompleto = {
        nombre: 'Test Student 3',
        usuario: '',
        correo: `test.student3.${Date.now()}@test.com`,
        contrasena: 'password123',
        rol: 'estudiante',
        matricula: 'C9876543210987',
        grupo: '1',
        anio: '2'
    };

    console.log('\n📋 Test 3: Completo (con matrícula, grupo y año)');
    try {
        const response = await axios.post('http://localhost:3001/api/usuarios', estudianteCompleto);
        console.log('✅ Éxito completo:', response.data.usuario);
    } catch (error) {
        console.log('❌ Error completo:', error.response?.data);
    }
}

testSimpleStudentCreation();
