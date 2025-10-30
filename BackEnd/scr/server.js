import app from './app.js';
import { getConnection } from './config/db.js'; // ← CORREGIDO: quitar /src

const PORT = process.env.PORT || 3001;

getConnection()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(` Servidor BrokerTEC corriendo en puerto ${PORT}`);
      console.log(` API disponible en: http://localhost:${PORT}/api`);
    });
  })
  .catch((error) => {
    console.error(' No se pudo conectar a la base de datos:', error.message);
    process.exit(1);
  });