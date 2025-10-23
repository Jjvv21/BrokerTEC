import { getConnection } from './scr/config/db.js';

async function testConnection() {
  try {
    const pool = await getConnection();
    
    // Hacer una consulta simple
    const result = await pool.request().query('SELECT name FROM sys.databases');
    console.log('✅ Conexión exitosa. Bases de datos disponibles:');
    result.recordset.forEach(db => console.log(` - ${db.name}`));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testConnection();