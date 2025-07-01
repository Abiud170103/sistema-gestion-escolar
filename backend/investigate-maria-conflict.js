const axios = require('axios');
const db = require('./src/config/db');

async function investigateSpecificConflict() {
    console.log('🔍 Investigando conflicto específico con María Jiménez...');
    
    const datosEstudiante = {
        nombre: 'Maria',
        apellido_paterno: 'Jimenez',
        correo: 'mariajmz@gmail.com',
        usuario: '', // Vacío para generación automática
        password: 'password123',
        rol: 'estudiante',
        grado: '1',
        grupo: '2'
    };

    try {
        // 1. Verificar si el correo ya existe en la base de datos
        console.log('📧 Verificando si el correo ya existe...');
        const correoExiste = await db.query('SELECT * FROM usuario WHERE correo = $1', [datosEstudiante.correo]);
        
        if (correoExiste.rows.length > 0) {
            console.log('❌ CONFLICTO ENCONTRADO: El correo ya existe en la base de datos');
            console.log('📝 Usuario existente:');
            correoExiste.rows.forEach(user => {
                console.log(`  - ID: ${user.id_usuario}`);
                console.log(`  - Nombre: ${user.nombre}`);
                console.log(`  - Usuario: ${user.usuario}`);
                console.log(`  - Correo: ${user.correo}`);
                console.log(`  - Rol: ${user.rol}`);
                console.log(`  - Fecha registro: ${user.created_at || 'No disponible'}`);
                console.log('  ---');
            });
        } else {
            console.log('✅ El correo NO existe en la base de datos');
        }

        // 2. Verificar qué usuario se generaría automáticamente
        console.log('\n👤 Verificando qué usuario se generaría...');
        const nombreLimpio = datosEstudiante.nombre.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Quitar acentos
            .replace(/[^a-z0-9]/g, ''); // Solo letras y números
        
        console.log(`🏷️ Usuario base que se generaría: "${nombreLimpio}"`);
        
        // Verificar si ese usuario ya existe
        const usuarioExiste = await db.query('SELECT * FROM usuario WHERE usuario = $1', [nombreLimpio]);
        
        if (usuarioExiste.rows.length > 0) {
            console.log('❌ CONFLICTO: El usuario base ya existe');
            console.log('📝 Usuario(s) existente(s):');
            usuarioExiste.rows.forEach(user => {
                console.log(`  - ID: ${user.id_usuario}, Nombre: ${user.nombre}, Usuario: ${user.usuario}, Correo: ${user.correo}`);
            });
            
            // Verificar variaciones
            console.log('\n🔄 Verificando variaciones del usuario...');
            for (let i = 1; i <= 5; i++) {
                const variacion = `${nombreLimpio}_${i}`;
                const variacionExiste = await db.query('SELECT * FROM usuario WHERE usuario = $1', [variacion]);
                if (variacionExiste.rows.length === 0) {
                    console.log(`✅ Primera variación disponible: ${variacion}`);
                    break;
                } else {
                    console.log(`❌ ${variacion} también existe`);
                }
            }
        } else {
            console.log('✅ El usuario base está disponible');
        }

        // 3. Intentar el registro real para ver el error exacto
        console.log('\n🧪 Intentando el registro real...');
        try {
            const response = await axios.post('http://localhost:3001/api/usuarios', datosEstudiante, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log('✅ ¡REGISTRO EXITOSO! (Esto es inesperado)');
            console.log('📋 Respuesta:', response.data);
        } catch (error) {
            if (error.response) {
                console.log('❌ ERROR del servidor:');
                console.log(`🔢 Status: ${error.response.status}`);
                console.log(`📝 Mensaje: ${JSON.stringify(error.response.data)}`);
                
                if (error.response.status === 409) {
                    console.log('\n🔍 Error 409 confirmado. Analizando causa...');
                    
                    // Verificar nuevamente después del intento
                    const verificacionFinal = await db.query(
                        'SELECT * FROM usuario WHERE correo = $1 OR usuario LIKE $2',
                        [datosEstudiante.correo, `${nombreLimpio}%`]
                    );
                    
                    console.log('📊 Usuarios que coinciden con correo o usuario similar:');
                    verificacionFinal.rows.forEach(user => {
                        console.log(`  - ID: ${user.id_usuario}, Usuario: ${user.usuario}, Correo: ${user.correo}, Rol: ${user.rol}`);
                    });
                }
            } else {
                console.log('❌ Error de conexión:', error.message);
            }
        }

    } catch (dbError) {
        console.error('❌ Error de base de datos:', dbError.message);
    } finally {
        await db.end();
    }
}

// Función para limpiar el correo específico si es necesario
async function limpiarCorreoEspecifico() {
    console.log('\n🧹 Función para limpiar el correo específico (no se ejecuta automáticamente)');
    console.log('Si necesitas eliminar el usuario con correo mariajmz@gmail.com, ejecuta:');
    console.log("DELETE FROM usuario WHERE correo = 'mariajmz@gmail.com';");
    
    // Descomentar las siguientes líneas solo si quieres eliminar automáticamente
    /*
    try {
        const result = await db.query("DELETE FROM usuario WHERE correo = 'mariajmz@gmail.com'");
        console.log(`✅ Eliminados ${result.rowCount} usuario(s) con ese correo`);
    } catch (error) {
        console.error('❌ Error al eliminar:', error.message);
    }
    */
}

investigateSpecificConflict();
