const db = require('./src/config/db');

async function generateDBDiagram() {
  try {
    console.log('🔍 Generando diagrama de la base de datos actualizada...\n');
    
    // Obtener todas las tablas
    const tablesResult = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📋 Tablas encontradas:');
    tablesResult.rows.forEach(table => {
      console.log(`- ${table.table_name}`);
    });
    
    console.log('\n🏗️ Estructura detallada de cada tabla:\n');
    
    for (const table of tablesResult.rows) {
      const tableName = table.table_name;
      
      // Obtener columnas de cada tabla
      const columnsResult = await db.query(`
        SELECT 
          column_name,
          data_type,
          character_maximum_length,
          is_nullable,
          column_default,
          ordinal_position
        FROM information_schema.columns 
        WHERE table_name = $1 
        ORDER BY ordinal_position
      `, [tableName]);
      
      console.log(`📊 Tabla: ${tableName.toUpperCase()}`);
      console.log('Columns:');
      columnsResult.rows.forEach(col => {
        const type = col.character_maximum_length ? 
          `${col.data_type}(${col.character_maximum_length})` : 
          col.data_type;
        const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        const defaultVal = col.column_default ? `DEFAULT ${col.column_default}` : '';
        
        console.log(`  - ${col.column_name}: ${type} ${nullable} ${defaultVal}`);
      });
      
      // Obtener foreign keys
      const fkResult = await db.query(`
        SELECT 
          tc.constraint_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_name = $1
      `, [tableName]);
      
      if (fkResult.rows.length > 0) {
        console.log('Foreign Keys:');
        fkResult.rows.forEach(fk => {
          console.log(`  - ${fk.column_name} -> ${fk.foreign_table_name}.${fk.foreign_column_name}`);
        });
      }
      
      // Obtener primary keys
      const pkResult = await db.query(`
        SELECT kcu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
          ON tc.constraint_name = kcu.constraint_name
        WHERE tc.constraint_type = 'PRIMARY KEY' 
        AND tc.table_name = $1
      `, [tableName]);
      
      if (pkResult.rows.length > 0) {
        console.log('Primary Keys:');
        pkResult.rows.forEach(pk => {
          console.log(`  - ${pk.column_name} (PK)`);
        });
      }
      
      console.log(''); // Línea en blanco
    }
    
    await db.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

generateDBDiagram();
