const db = require('./src/config/db');

async function limpiarUsuarioPrueba() {
    console.log('🧹 Limpiando usuario de prueba María Jiménez...');
    
    try {
        // Verificar qué usuario vamos a eliminar
        const usuarioAEliminar = await db.query("SELECT * FROM usuario WHERE correo = 'mariajmz@gmail.com'");
        
        if (usuarioAEliminar.rows.length > 0) {
            console.log('📝 Usuario a eliminar:');
            usuarioAEliminar.rows.forEach(user => {
                console.log(`  - ID: ${user.id_usuario}`);
                console.log(`  - Nombre: ${user.nombre}`);
                console.log(`  - Usuario: ${user.usuario}`);
                console.log(`  - Correo: ${user.correo}`);
                console.log(`  - Rol: ${user.rol}`);
            });
            
            // Eliminar el usuario
            const result = await db.query("DELETE FROM usuario WHERE correo = 'mariajmz@gmail.com'");
            console.log(`✅ Eliminado exitosamente: ${result.rowCount} usuario(s)`);
            
            // Verificar que se eliminó
            const verificacion = await db.query("SELECT * FROM usuario WHERE correo = 'mariajmz@gmail.com'");
            if (verificacion.rows.length === 0) {
                console.log('✅ Confirmado: El usuario ya no existe en la base de datos');
            } else {
                console.log('❌ Error: El usuario aún existe');
            }
            
        } else {
            console.log('ℹ️  No se encontró usuario con ese correo');
        }
        
    } catch (error) {
        console.error('❌ Error al limpiar usuario:', error.message);
    } finally {
        await db.end();
    }
}

limpiarUsuarioPrueba();
