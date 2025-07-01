const db = require('./src/config/db');

async function investigateUserConflict() {
  try {
    console.log('🕵️ INVESTIGANDO CONFLICTO DE USUARIO');
    console.log('='.repeat(50));
    
    // Datos del usuario que se intenta registrar
    const datosNuevos = {
      nombre: 'Ana Karen',
      correo: 'ana28002@secundaria.com',
      rol: 'docente'
    };
    
    console.log('👤 Usuario que se intenta registrar:');
    console.table(datosNuevos);
    
    // 1. Verificar si existe el correo
    console.log('\n📧 Verificando correo en base de datos...');
    const correoExiste = await db.query('SELECT * FROM usuario WHERE correo = $1', [datosNuevos.correo]);
    
    if (correoExiste.rows.length > 0) {
      console.log('❌ El correo YA EXISTE:');
      console.table(correoExiste.rows);
    } else {
      console.log('✅ El correo NO existe en la base de datos');
    }
    
    // 2. Verificar si existe usuario similar
    console.log('\n👤 Verificando usuarios similares...');
    const usuariosSimilares = await db.query(`
      SELECT * FROM usuario 
      WHERE LOWER(correo) LIKE LOWER($1) 
         OR LOWER(nombre) LIKE LOWER($2)
    `, [`%${datosNuevos.correo}%`, `%${datosNuevos.nombre}%`]);
    
    if (usuariosSimilares.rows.length > 0) {
      console.log('⚠️ Usuarios similares encontrados:');
      console.table(usuariosSimilares.rows);
    } else {
      console.log('✅ No hay usuarios similares');
    }
    
    // 3. Verificar todos los correos que contienen 'ana'
    console.log('\n🔍 Usuarios con "ana" en el correo o nombre:');
    const anasEnBD = await db.query(`
      SELECT id_usuario, nombre, correo, rol 
      FROM usuario 
      WHERE LOWER(correo) LIKE '%ana%' 
         OR LOWER(nombre) LIKE '%ana%'
    `);
    
    if (anasEnBD.rows.length > 0) {
      console.table(anasEnBD.rows);
    } else {
      console.log('No hay usuarios con "ana" en la BD');
    }
    
    // 4. Verificar correos del dominio @secundaria.com
    console.log('\n🏫 Usuarios del dominio @secundaria.com:');
    const secundariaUsers = await db.query(`
      SELECT id_usuario, nombre, correo, rol 
      FROM usuario 
      WHERE correo LIKE '%@secundaria.com'
    `);
    
    if (secundariaUsers.rows.length > 0) {
      console.table(secundariaUsers.rows);
    } else {
      console.log('No hay usuarios con @secundaria.com');
    }
    
    // 5. Contar total de usuarios
    console.log('\n📊 Estadísticas generales:');
    const totalUsers = await db.query('SELECT COUNT(*) as total FROM usuario');
    const porRol = await db.query(`
      SELECT rol, COUNT(*) as cantidad 
      FROM usuario 
      GROUP BY rol 
      ORDER BY cantidad DESC
    `);
    
    console.log(`Total de usuarios: ${totalUsers.rows[0].total}`);
    console.table(porRol.rows);
    
    // 6. Simular la consulta exacta del endpoint
    console.log('\n🎯 Simulando consulta exacta del endpoint...');
    
    // Necesitamos saber qué campo "usuario" se está enviando
    // Como no se especifica, vamos a generar uno probable
    const posiblesUsuarios = [
      'ana28002',
      'ana.karen',
      'akaren',
      'ana_karen',
      'ANA28002'
    ];
    
    for (const usuarioPrueba of posiblesUsuarios) {
      const existe = await db.query(
        'SELECT correo, usuario FROM usuario WHERE correo = $1 OR usuario = $2', 
        [datosNuevos.correo, usuarioPrueba]
      );
      
      if (existe.rows.length > 0) {
        console.log(`❌ Conflicto encontrado con usuario "${usuarioPrueba}":`);
        console.table(existe.rows);
      } else {
        console.log(`✅ No hay conflicto con usuario "${usuarioPrueba}"`);
      }
    }
    
    console.log('\n💡 Recomendación:');
    console.log('1. Verificar qué valor se está enviando en el campo "usuario"');
    console.log('2. Usar un campo "usuario" único (ej: ana_karen_28002)');
    console.log('3. Verificar que el correo no tenga espacios o caracteres ocultos');
    
  } catch (error) {
    console.error('❌ Error en investigación:', error.message);
  } finally {
    await db.end();
  }
}

investigateUserConflict();
