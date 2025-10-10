
SELECT * FROM evento_admin;
SELECT * FROM historico_precio;
SELECT * FROM transaccion;
SELECT * FROM usuario_mercado;
SELECT * FROM wallet;
SELECT * FROM recarga;
SELECT * FROM audit_log;
SELECT * FROM empresa;
SELECT * FROM usuario;
SELECT * FROM mercado;
SELECT * FROM rol;
SELECT * FROM tesoreria;
SELECT * FROM transaccion;
SELECT * FROM recarga;


-- =============================================
-- EJEMPLOS DE USO - STORED PROCEDURES
-- =============================================

/*
-- 1. SP_CrearUsuario - Crear nuevo usuario
EXEC SP_CrearUsuario 
    @nombre = 'Juan Pérez',
    @alias = 'juanp',
    @direccion = 'Av. Principal 123',
    @pais = 'México',
    @telefono = '555-1234',
    @email = 'juan@email.com',
    @contrasena = 'miPassword123',
    @rol = 'Trader',
    @categoria = 'Junior';
*/

/*
-- 2. SP_ActualizarPerfilUsuario - Actualizar perfil
EXEC SP_ActualizarPerfilUsuario 
    @id_usuario = 1,
    @nombre = 'Juan Pérez Actualizado',
    @alias = 'juanp_nuevo',
    @direccion = 'Nueva Dirección 456',
    @pais = 'España',
    @telefono = '555-5678',
    @email = 'juan.nuevo@email.com';
*/

/*
-- 3. SP_CambiarContraseña - Cambiar contraseña
EXEC SP_CambiarContraseña 
    @id_usuario = 1,
    @nueva_contrasena = 'nuevaPassword456';
*/

/*
-- 4. SP_DeshabilitarUsuario - Deshabilitar usuario y liquidar portafolio
EXEC SP_DeshabilitarUsuario 
    @id_usuario = 2,
    @justificacion = 'Usuario inactivo por 90 días',
    @id_admin = 1;
*/

/*
-- 5. SP_AsignarCategoria - Cambiar categoría de usuario
EXEC SP_AsignarCategoria 
    @id_usuario = 2,
    @categoria = 'Senior';
*/

/*
-- 6. SP_AsignarMercados - Asignar mercados a usuario
EXEC SP_AsignarMercados 
    @id_usuario = 2,
    @ids_mercados = '1,2,3';  -- IDs separados por comas
*/

/*
-- 7. SP_CrearMercado - Crear nuevo mercado
EXEC SP_CrearMercado 
    @nombre = 'NASDAQ - Tecnología';
*/

/*
-- 8. SP_ActualizarMercado - Actualizar nombre de mercado
EXEC SP_ActualizarMercado 
    @id_mercado = 1,
    @nombre = 'NYSE - Bolsa de Nueva York Actualizada';
*/

/*
-- 9. SP_EliminarMercado - Eliminar mercado (solo si no tiene empresas)
EXEC SP_EliminarMercado 
    @id_mercado = 5;
*/

/*
-- 10. SP_CrearEmpresa - Crear nueva empresa
EXEC SP_CrearEmpresa 
    @id_mercado = 1,
    @nombre = 'Google Inc. (GOOGL)',
    @cantidad_acciones = 5000000,
    @precio_inicial = 150.75;
*/

/*
-- 11. SP_ActualizarEmpresa - Actualizar datos de empresa
EXEC SP_ActualizarEmpresa 
    @id_empresa = 1,
    @nombre = 'Apple Inc. (AAPL) - Actualizado',
    @cantidad_acciones = 12000000;
*/

/*
-- 12. SP_DelistarEmpresa - Delistar empresa y liquidar inversiones
EXEC SP_DelistarEmpresa 
    @id_empresa = 1,
    @justificacion = 'Bajo volumen de operaciones',
    @precio_fijo = 180.50,  -- Opcional: precio fijo de liquidación
    @id_admin = 1;
*/

/*
-- 13. SP_ActualizarPrecio - Actualizar precio de empresa
EXEC SP_ActualizarPrecio 
    @id_empresa = 1,
    @nuevo_precio = 185.25;
*/

/*
-- 14. SP_RecargarWallet - Recargar saldo de usuario
EXEC SP_RecargarWallet 
    @id_usuario = 2,
    @monto = 1000.00;
*/

/*
-- 15. SP_ComprarAcciones - Comprar acciones de una empresa
EXEC SP_ComprarAcciones 
    @id_usuario = 2,
    @id_empresa = 1,
    @cantidad = 10;
*/

/*
-- 16. SP_VenderAcciones - Vender acciones de una empresa
EXEC SP_VenderAcciones 
    @id_usuario = 2,
    @id_empresa = 1,
    @cantidad = 5;
*/

/*
-- 17. SP_LiquidarTodo - Liquidar todo el portafolio de un usuario
EXEC SP_LiquidarTodo 
    @id_usuario = 2;
*/

-- =============================================
-- VALORES VÁLIDOS PARA PARÁMETROS
-- =============================================

/*
Roles válidos: 'Admin', 'Trader', 'Analyst'
Categorías válidas: 'Junior', 'Mid', 'Senior', 'VIP'
Tipos de transacción: 'compra', 'venta', 'liquidacion'
Estados de mercado: 'habilitado', 'deshabilitado'
*/

-- =============================================
-- CONSULTAS ÚTILES PARA OBTENER IDs
-- =============================================

/*
-- Ver usuarios existentes
SELECT id_usuario, alias, nombre FROM usuario;

-- Ver empresas existentes
SELECT id_empresa, nombre, precio_actual FROM empresa WHERE activo = 1;

-- Ver mercados existentes
SELECT id_mercado, nombre, estado FROM mercado;

-- Ver portafolio de usuario
SELECT * FROM portafolio WHERE id_usuario = 2;

-- Ver wallet de usuario
SELECT * FROM wallet WHERE id_usuario = 2;
*/