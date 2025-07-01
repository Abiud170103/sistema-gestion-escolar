const db = require('./src/config/db');

async function simulateUserCreation() {
  try {
    console.log('🎭 SIMULANDO CREACIÓN DE USUARIO DESDE FRONTEND');
    console.log('='.repeat(60));
    
    // Datos que probablemente se envían desde el frontend para Ana Karen
    const payloadsParaProbar = [
      {
        nombre: 'Ana Karen',
        usuario: '', // Campo vacío
        correo: 'ana28002@secundaria.com',
        contrasena: 'temporal123',
        rol: 'docente'
      },
      {
        nombre: 'Ana Karen',
        usuario: 'ana28002', // Usuario probable
        correo: 'ana28002@secundaria.com',
        contrasena: 'temporal123',
        rol: 'docente'
      },
      {
        nombre: 'Ana Karen',
        usuario: null, // Campo null
        correo: 'ana28002@secundaria.com',
        contrasena: 'temporal123',
        rol: 'docente'
      }
    ];
    
    for (let i = 0; i < payloadsParaProbar.length; i++) {
      const payload = payloadsParaProbar[i];
      console.log(`\n🧪 Prueba ${i + 1}: usuario = "${payload.usuario}"`);
      console.table(payload);
      
      try {
        // Simular la validación del endpoint
        console.log('📋 Validando campos requeridos...');
        const { nombre, usuario, correo, contrasena, rol } = payload;
        
        if (!nombre || !usuario || !correo || !contrasena || !rol) {
          console.log('❌ Faltan datos requeridos');
          console.log(`nombre: ${nombre ? '✅' : '❌'}`);
          console.log(`usuario: ${usuario ? '✅' : '❌'}`);
          console.log(`correo: ${correo ? '✅' : '❌'}`);
          console.log(`contrasena: ${contrasena ? '✅' : '❌'}`);
          console.log(`rol: ${rol ? '✅' : '❌'}`);
          continue;
        }
        
        console.log('✅ Todos los campos requeridos presentes');
        
        // Validar formato de correo
        const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
        if (!emailRegex.test(correo)) {
          console.log('❌ Correo electrónico no válido');
          continue;
        }
        
        console.log('✅ Formato de correo válido');
        
        // Validar unicidad (la consulta problemática)
        console.log('🔍 Verificando unicidad...');
        const existe = await db.query('SELECT correo, usuario FROM usuario WHERE correo = $1 OR usuario = $2', [correo, usuario]);
        
        if (existe.rows.length > 0) {
          console.log('❌ El correo o usuario ya está registrado:');
          console.table(existe.rows);
        } else {
          console.log('✅ No hay conflictos, se puede crear el usuario');
        }
        
      } catch (error) {
        console.log('❌ Error en validación:', error.message);
      }
    }
    
    // Verificar usuarios existentes con campos vacíos o problemáticos
    console.log('\n🔍 Verificando usuarios con campos problemáticos en BD...');
    
    const usuariosProblematicos = await db.query(`
      SELECT id_usuario, nombre, usuario, correo, rol 
      FROM usuario 
      WHERE usuario = '' OR usuario IS NULL OR LENGTH(TRIM(usuario)) = 0
    `);
    
    if (usuariosProblematicos.rows.length > 0) {
      console.log('⚠️ Usuarios con campo "usuario" problemático:');
      console.table(usuariosProblematicos.rows);
    } else {
      console.log('✅ No hay usuarios con campos "usuario" problemáticos');
    }
    
    // Sugerir solución
    console.log('\n💡 SOLUCIÓN SUGERIDA:');
    console.log('1. El frontend debe generar automáticamente el campo "usuario" para docentes');
    console.log('2. Usar formato: nombre.apellido o iniciales + número');
    console.log('3. Ejemplo para Ana Karen: "ana.karen", "akaren", "ana_karen_001"');
    
    // Generar usuario automático para Ana Karen
    console.log('\n🤖 Generando usuario automático para Ana Karen...');
    const nombreLimpio = 'Ana Karen'.toLowerCase().replace(/\s+/g, '_');
    const usuarioSugerido = nombreLimpio;
    
    const existeUsuarioSugerido = await db.query('SELECT 1 FROM usuario WHERE usuario = $1', [usuarioSugerido]);
    
    if (existeUsuarioSugerido.rows.length > 0) {
      console.log(`⚠️ Usuario "${usuarioSugerido}" ya existe, probando variantes...`);
      
      for (let i = 1; i <= 10; i++) {
        const variante = `${usuarioSugerido}_${i}`;
        const existeVariante = await db.query('SELECT 1 FROM usuario WHERE usuario = $1', [variante]);
        
        if (existeVariante.rows.length === 0) {
          console.log(`✅ Usuario disponible: "${variante}"`);
          break;
        }
      }
    } else {
      console.log(`✅ Usuario disponible: "${usuarioSugerido}"`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await db.end();
  }
}

simulateUserCreation();
