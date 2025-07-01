const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'secundaria',
  password: '040917',
  port: 5432,
});

async function cleanupDuplicates() {
  try {
    console.log('=== CHECKING DUPLICATE MATRICULAS ===');
    
    // Find students with duplicate matricula
    const duplicates = await pool.query(`
      SELECT u.id_usuario, u.nombre, u.usuario, e.matricula
      FROM usuario u
      JOIN estudiante e ON u.id_usuario = e.id_usuario
      WHERE e.matricula = 'C1234567890123'
      ORDER BY u.id_usuario
    `);
    
    console.log('Students with duplicate matricula:');
    console.table(duplicates.rows);
    
    if (duplicates.rows.length > 1) {
      // Keep the first one, delete the others
      const toKeep = duplicates.rows[0];
      const toDelete = duplicates.rows.slice(1);
      
      console.log(`\nKeeping student: ${toKeep.nombre} (ID: ${toKeep.id_usuario})`);
      
      for (const student of toDelete) {
        console.log(`Deleting student: ${student.nombre} (ID: ${student.id_usuario})`);
        
        // Delete from estudiante table first (foreign key constraint)
        await pool.query('DELETE FROM estudiante WHERE id_usuario = $1', [student.id_usuario]);
        
        // Delete from usuario table
        await pool.query('DELETE FROM usuario WHERE id_usuario = $1', [student.id_usuario]);
      }
      
      console.log('\n✅ Duplicates cleaned up');
    }
    
    // Verify final state
    const finalCheck = await pool.query(`
      SELECT matricula, COUNT(*) as count
      FROM estudiante
      GROUP BY matricula
      HAVING COUNT(*) > 1
    `);
    
    if (finalCheck.rows.length === 0) {
      console.log('✅ No duplicate matriculas remaining');
    } else {
      console.log('❌ Still have duplicates:');
      console.table(finalCheck.rows);
    }
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

cleanupDuplicates();
