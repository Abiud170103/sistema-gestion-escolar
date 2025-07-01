const db = require('./src/config/db');

async function investigateDatabase() {
    console.log('🔍 Investigando posibles problemas en la base de datos...');
    
    try {
        // Buscar usuarios con campos problemáticos
        console.log('\n1. Usuarios con campo usuario vacío o null:');
        const usuariosVacios = await db.query(
            "SELECT id_usuario, nombre, usuario, correo, rol FROM usuario WHERE usuario IS NULL OR usuario = '' OR trim(usuario) = ''"
        );
        console.log(`Encontrados: ${usuariosVacios.rows.length}`);
        usuariosVacios.rows.forEach(u => console.log(`  - ID: ${u.id_usuario}, Nombre: ${u.nombre}, Usuario: '${u.usuario}', Correo: ${u.correo}`));
        
        // Buscar usuarios duplicados por correo
        console.log('\n2. Correos duplicados:');
        const correosDuplicados = await db.query(`
            SELECT correo, COUNT(*) as cantidad 
            FROM usuario 
            GROUP BY correo 
            HAVING COUNT(*) > 1
        `);
        console.log(`Encontrados: ${correosDuplicados.rows.length}`);
        correosDuplicados.rows.forEach(c => console.log(`  - Correo: ${c.correo}, Cantidad: ${c.cantidad}`));
        
        // Buscar usuarios duplicados por campo usuario
        console.log('\n3. Usuarios duplicados:');
        const usuariosDuplicados = await db.query(`
            SELECT usuario, COUNT(*) as cantidad 
            FROM usuario 
            WHERE usuario IS NOT NULL AND usuario != ''
            GROUP BY usuario 
            HAVING COUNT(*) > 1
        `);
        console.log(`Encontrados: ${usuariosDuplicados.rows.length}`);
        usuariosDuplicados.rows.forEach(u => console.log(`  - Usuario: ${u.usuario}, Cantidad: ${u.cantidad}`));
        
        // Buscar estudiantes con correos que podrían tener conflictos comunes
        console.log('\n4. Estudiantes con correos comunes que podrían causar conflicto:');
        const estudiantesComunes = await db.query(`
            SELECT * FROM usuario 
            WHERE correo LIKE '%estudiante%' OR correo LIKE '%test%' OR correo LIKE '%ejemplo%'
            ORDER BY correo
        `);
        console.log(`Encontrados: ${estudiantesComunes.rows.length}`);
        estudiantesComunes.rows.forEach(e => console.log(`  - ID: ${e.id_usuario}, Usuario: ${e.usuario}, Correo: ${e.correo}`));
        
        // Verificar último ID insertado
        console.log('\n5. Último usuario registrado:');
        const ultimoUsuario = await db.query('SELECT * FROM usuario ORDER BY id_usuario DESC LIMIT 1');
        if (ultimoUsuario.rows.length > 0) {
            const ultimo = ultimoUsuario.rows[0];
            console.log(`  - ID: ${ultimo.id_usuario}, Usuario: ${ultimo.usuario}, Correo: ${ultimo.correo}, Rol: ${ultimo.rol}`);
        }
        
    } catch (error) {
        console.error('❌ Error al investigar la base de datos:', error.message);
    } finally {
        await db.end();
    }
}

async function cleanupProblematicData() {
    console.log('\n🧹 Limpiando datos problemáticos...');
    
    try {
        // Limpiar usuarios de prueba
        const testEmails = [
            'ana.garcia@estudiante.test',
            'carlos.martinez@estudiante.test',
            'maria.sanchez@estudiante.test',
            'pedro.gonzalez@estudiante.test',
            'luis.unique1@estudiante.test',
            'sofia.unique2@estudiante.test',
            'otro.correo@estudiante.test'
        ];
        
        console.log('Eliminando usuarios de prueba...');
        for (const email of testEmails) {
            const result = await db.query('DELETE FROM usuario WHERE correo = $1', [email]);
            if (result.rowCount > 0) {
                console.log(`  ✅ Eliminado usuario con correo: ${email}`);
            }
        }
        
        // Eliminar usuarios con campo usuario vacío/null (pero mantener datos importantes)
        console.log('\nRevisando usuarios con campo usuario problemático...');
        const problemUsers = await db.query(
            "SELECT * FROM usuario WHERE usuario IS NULL OR usuario = '' OR trim(usuario) = ''"
        );
        
        if (problemUsers.rows.length > 0) {
            console.log(`Encontrados ${problemUsers.rows.length} usuarios con campo usuario problemático:`);
            problemUsers.rows.forEach(u => {
                console.log(`  - ID: ${u.id_usuario}, Nombre: ${u.nombre}, Correo: ${u.correo}, Usuario: '${u.usuario}'`);
            });
            
            // Por seguridad, no los eliminamos automáticamente, solo los reportamos
            console.log('⚠️  No se eliminan automáticamente. Revisar manualmente si es necesario.');
        } else {
            console.log('✅ No se encontraron usuarios con campo usuario problemático.');
        }
        
    } catch (error) {
        console.error('❌ Error al limpiar datos:', error.message);
    }
}

async function runInvestigation() {
    await investigateDatabase();
    // Comentar la siguiente línea si no quieres limpiar datos automáticamente
    // await cleanupProblematicData();
}

runInvestigation();
