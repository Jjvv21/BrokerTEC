import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config(); // ← Esto carga el .env

const config = {
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'BrokerTEC',
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'ejemplo', //sus contraseñas del usuario sa del SERVER
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

export async function getConnection() {
  try {
    const pool = await sql.connect(config);
    console.log(' CONEXIÓN EXITOSA!');
    return pool;
  } catch (err) {
    console.log(' Error:', err.message);
    throw err;
  }
}

export { sql };