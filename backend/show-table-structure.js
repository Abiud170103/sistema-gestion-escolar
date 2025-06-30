const db = require('./src/config/db');

async function showActiveUsers() {
  try {
    console.log('👥 Usuarios activos de padres:');
    console.log('='.repeat(50));
    
    const result = await db.query(`
      SELECT 
        u.usuario,
        u.nombre,
        u.correo
      FROM usuario u
      WHERE u.rol = 'padre'
      ORDER BY u.nombre
    `);
    
    result.rows.forEach(user => {
      console.log(`📧 ${user.usuario} - ${user.nombre}`);
      console.log(`   Email: ${user.correo}`);
    });
    
    console.log(`\n✅ Total: ${result.rows.length} padres activos`);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit();
  }
}

showActiveUsers();
