const fs = require('fs');
const path = require('path');
const db = require('./src/config/db');

async function runMigration() {
  try {
    console.log('Ejecutando migración: 20250624_add_incidencia_fields.sql');
    
    const migrationPath = path.join(__dirname, 'migrations', '20250624_add_incidencia_fields.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    await db.query(migrationSQL);
    
    console.log('✅ Migración ejecutada correctamente');
    
    // Verificar que las columnas se crearon
    const result = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'incidencia' 
      ORDER BY column_name
    `);
    
    console.log('📊 Columnas en la tabla incidencia:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });
    
  } catch (error) {
    console.error('❌ Error ejecutando migración:', error.message);
  } finally {
    process.exit(0);
  }
}

runMigration();
