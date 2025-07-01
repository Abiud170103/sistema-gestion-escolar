const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'secundaria',
  password: '040917',
  port: 5432,
});

async function cleanupTestData() {
  try {
    console.log('=== LIMPIANDO DATOS DE PRUEBA PARA EVITAR CONFLICTOS ===');
    
    // First, delete from estudiante table (foreign key constraint)
    const deleteEstudiantes = await pool.query(`
      DELETE FROM estudiante 
      WHERE id_usuario IN (
        SELECT id_usuario FROM usuario 
        WHERE correo LIKE '%test%' 
           OR correo LIKE '%example%' 
           OR correo LIKE '%estudiante.test%'
           OR correo LIKE '%@test.com%'
      )
    `);
    console.log(`Estudiantes eliminados: ${deleteEstudiantes.rowCount}`);
    
    // Then delete from usuario table
    const deleteUsuarios = await pool.query(`
      DELETE FROM usuario 
      WHERE correo LIKE '%test%' 
         OR correo LIKE '%example%' 
         OR correo LIKE '%estudiante.test%'
         OR correo LIKE '%@test.com%'
    `);
    console.log(`Usuarios eliminados: ${deleteUsuarios.rowCount}`);
    
    console.log('\n✅ Datos de prueba limpiados');
    
    // Show remaining users
    const remainingUsers = await pool.query(`
      SELECT COUNT(*) as total, 
             COUNT(CASE WHEN rol = 'estudiante' THEN 1 END) as estudiantes,
             COUNT(CASE WHEN rol = 'docente' THEN 1 END) as docentes,
             COUNT(CASE WHEN rol = 'padre' THEN 1 END) as padres,
             COUNT(CASE WHEN rol = 'administrador' THEN 1 END) as administradores
      FROM usuario
    `);
    
    console.log('\n=== USUARIOS RESTANTES ===');
    console.table(remainingUsers.rows);
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

cleanupTestData();
