const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'secundaria',
  password: '040917',
  port: 5432,
});

async function fixSequence() {
  try {
    // Get the current max id_grupo
    const maxId = await pool.query('SELECT MAX(id_grupo) as max_id FROM grupo');
    const currentMax = maxId.rows[0].max_id || 0;
    
    console.log(`Current max id_grupo: ${currentMax}`);
    
    // Get the current sequence value (use nextval to initialize if needed)
    const seqValue = await pool.query("SELECT last_value FROM grupo_id_grupo_seq");
    console.log(`Current sequence value: ${seqValue.rows[0].last_value}`);
    
    // Set the sequence to the correct value (max + 1)
    const newSeqValue = currentMax + 1;
    await pool.query(`SELECT setval('grupo_id_grupo_seq', $1, false)`, [newSeqValue]);
    
    console.log(`Sequence reset to: ${newSeqValue}`);
    
    // Test the fix
    console.log('\n=== TESTING AFTER FIX ===');
    const anio = 1;
    const grupo = 1;
    const turnoDescripcion = `Grupo ${grupo} - ${anio}° año`;
    
    const nuevoGrupo = await pool.query(
      'INSERT INTO grupo (anio, turno) VALUES ($1, $2) RETURNING id_grupo',
      [parseInt(anio), turnoDescripcion]
    );
    console.log(`New group created successfully with id: ${nuevoGrupo.rows[0].id_grupo}`);
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

fixSequence();
