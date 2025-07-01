const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'secundaria',
  password: '040917',
  port: 5432,
});

async function investigateConflict() {
  try {
    console.log('=== INVESTIGANDO ERROR 409 DESDE FRONTEND ===');
    
    // Check for recent entries that might be causing conflicts
    console.log('\n1. Últimos usuarios registrados:');
    const recentUsers = await pool.query(`
      SELECT id_usuario, nombre, usuario, correo, rol
      FROM usuario 
      ORDER BY id_usuario DESC 
      LIMIT 10
    `);
    console.table(recentUsers.rows);
    
    // Check for duplicate emails
    console.log('\n2. Emails duplicados:');
    const duplicateEmails = await pool.query(`
      SELECT correo, COUNT(*) as count
      FROM usuario
      GROUP BY correo
      HAVING COUNT(*) > 1
    `);
    
    if (duplicateEmails.rows.length > 0) {
      console.table(duplicateEmails.rows);
    } else {
      console.log('✅ No hay emails duplicados');
    }
    
    // Check for duplicate usernames
    console.log('\n3. Usuarios duplicados:');
    const duplicateUsernames = await pool.query(`
      SELECT usuario, COUNT(*) as count
      FROM usuario
      GROUP BY usuario
      HAVING COUNT(*) > 1
    `);
    
    if (duplicateUsernames.rows.length > 0) {
      console.table(duplicateUsernames.rows);
    } else {
      console.log('✅ No hay usuarios duplicados');
    }
    
    // Check for specific test data that might be causing issues
    console.log('\n4. Datos de prueba que podrían causar conflictos:');
    const testData = await pool.query(`
      SELECT id_usuario, nombre, usuario, correo
      FROM usuario
      WHERE correo LIKE '%test%' OR correo LIKE '%example%'
      ORDER BY id_usuario DESC
    `);
    console.table(testData.rows);
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

investigateConflict();
