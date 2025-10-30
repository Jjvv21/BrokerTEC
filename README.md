### Configurar Base de Datos

1. **Usar usuario existente `sa`:**
   - El usuario `sa` ya viene con SQL Server
   - Solo necesitan asignarle una contraseña (la que viene en db.js es la que yo usé localmente)

2. **O crear nuevo usuario:**
   ```sql
   CREATE LOGIN brokertec_user WITH PASSWORD = 'BrokerTEC123!'; 
   ALTER SERVER ROLE sysadmin ADD MEMBER brokertec_user;
   ```

3. **Configurar .env:**
   - Ya está el `.env.example` como template
   ```env
   DB_SERVER=localhost
   DB_NAME=BrokerTEC
   DB_USER=sa                    # o brokertec_user
   DB_PASSWORD=tu_contraseña
   ```

4. **Conectar con la base BrokerTEC:**
   - Ejecutar el script: `data/valores_semilla.sql`

5. **Probar conexión:**
   ```bash
   node test-db.js
   ```
