USE BrokerTEC;
GO

-- ==================================================
-- 1️⃣ Vaciar tablas dependientes primero
-- ==================================================
DELETE FROM [dbo].[transaccion];
DELETE FROM [dbo].[portafolio];
DELETE FROM [dbo].[wallet];
DELETE FROM [dbo].[tesoreria];
DELETE FROM [dbo].[historico_precio];
DELETE FROM [dbo].[usuario_mercado];
DELETE FROM [dbo].[evento_admin];
DELETE FROM [dbo].[recarga];

-- ==================================================
-- 2️⃣ Vaciar tablas “padre”
-- ==================================================
DELETE FROM [dbo].[usuario];
DELETE FROM [dbo].[empresa];
DELETE FROM [dbo].[mercado];
DELETE FROM [dbo].[categoria];
DELETE FROM [dbo].[rol];

-- ==================================================
-- Reiniciar IDENTITY
-- ==================================================
DBCC CHECKIDENT ('[dbo].[rol]', RESEED, 0);
DBCC CHECKIDENT ('[dbo].[categoria]', RESEED, 0);
DBCC CHECKIDENT ('[dbo].[mercado]', RESEED, 0);
DBCC CHECKIDENT ('[dbo].[usuario]', RESEED, 0);
DBCC CHECKIDENT ('[dbo].[empresa]', RESEED, 0);
DBCC CHECKIDENT ('[dbo].[tesoreria]', RESEED, 0);
DBCC CHECKIDENT ('[dbo].[historico_precio]', RESEED, 0);
DBCC CHECKIDENT ('[dbo].[transaccion]', RESEED, 0);
DBCC CHECKIDENT ('[dbo].[wallet]', RESEED, 0);
DBCC CHECKIDENT ('[dbo].[recarga]', RESEED, 0);
DBCC CHECKIDENT ('[dbo].[evento_admin]', RESEED, 0);
DBCC CHECKIDENT ('[dbo].[portafolio]', RESEED, 0);

-- ==================================================
-- 3️⃣ Insertar valores semilla válidos
-- ==================================================

-- Rol (válidos según constraint chk_rol)
INSERT INTO [dbo].[rol] (nombre_rol, descripcion) VALUES
('Admin', 'Administrador del sistema'),
('Trader', 'Operador de mercado autorizado'),
('Analyst', 'Analista financiero y técnico');

-- Categoría (válidos según chk_categoria)
INSERT INTO [dbo].[categoria] (nombre_categoria, limite_diario) VALUES
('Junior', 1000.00),
('Mid', 5000.00),
('Senior', 20000.00);

-- Mercados
INSERT INTO [dbo].[mercado] (nombre, estado) VALUES
('Mercado Norte', 'habilitado'),
('Mercado Sur', 'habilitado'),
('Mercado Experimental', 'deshabilitado');

-- Usuarios
INSERT INTO [dbo].[usuario]
(id_rol, id_categoria, alias, estado, nombre, correo, telefono, direccion, pais_de_origen, password_hash, last_access)
VALUES
(1, 3, 'admin01', 1, 'Administrador General', 'admin@test.com', '1111-1111', 'Edificio Central 1', 'Costa Rica', 'hash_admin', GETDATE()),
(2, 1, 'trader01', 1, 'Trader Junior Uno', 'trader1@test.com', '2222-2222', 'Av. Bursátil 12', 'México', 'hash_trader1', GETDATE()),
(2, 2, 'trader02', 1, 'Trader Medio Dos', 'trader2@test.com', '3333-3333', 'Av. Mercado 5', 'Chile', 'hash_trader2', GETDATE()),
(2, 3, 'trader03', 1, 'Trader Senior Tres', 'trader3@test.com', '4444-4444', 'Zona Financiera 9', 'España', 'hash_trader3', GETDATE()),
(3, 2, 'analyst01', 1, 'Analista Uno', 'analyst1@test.com', '5555-5555', 'Oficina Central', 'Argentina', 'hash_analyst', GETDATE());

-- Empresas
INSERT INTO [dbo].[empresa] (id_mercado, nombre, precio_actual, cantidad_acciones, activo) VALUES
(1, 'Empresa Alpha', 10.25, 100000, 1),
(1, 'Empresa Beta', 25.60, 50000, 1),
(2, 'Empresa Gamma', 15.10, 75000, 1),
(3, 'Empresa Delta', 8.90, 40000, 0);

-- Tesorería
INSERT INTO [dbo].[tesoreria] (id_empresa, acciones_disponibles) VALUES
(1, 100000),
(2, 50000),
(3, 75000),
(4, 40000);

-- Wallet
INSERT INTO [dbo].[wallet] (id_usuario, saldo) VALUES
(1, 20000.00),
(2, 5000.00),
(3, 8000.00),
(4, 12000.00),
(5, 3000.00);

-- Recargas (cada una referenciada a una wallet existente)
INSERT INTO [dbo].[recarga] (id_wallet, monto, fecha) VALUES
(2, 1000.00, DATEADD(DAY, -3, GETDATE())),
(3, 2000.00, DATEADD(DAY, -2, GETDATE())),
(4, 1500.00, GETDATE());

-- Usuario-Mercado
INSERT INTO [dbo].[usuario_mercado] (id_usuario, id_mercado) VALUES
(2, 1),
(3, 1),
(3, 2),
(4, 2),
(5, 1);

-- Portafolio
INSERT INTO [dbo].[portafolio] (id_usuario, id_empresa, id_mercado, cantidad, costo_promedio) VALUES
(2, 1, 1, 100, 10.25),
(3, 2, 1, 50, 25.60),
(4, 3, 2, 80, 15.10);

-- Histórico de precios
INSERT INTO [dbo].[historico_precio] (id_empresa, precio, fecha) VALUES
(1, 10.25, DATEADD(DAY, -2, GETDATE())),
(1, 10.30, GETDATE()),
(2, 25.50, DATEADD(DAY, -1, GETDATE())),
(3, 15.10, GETDATE());

-- Transacciones (valores válidos para chk_tipo_tx)
INSERT INTO [dbo].[transaccion] (id_usuario, id_empresa, tipo, cantidad, precio, fecha) VALUES
(2, 1, 'compra', 100, 10.25, GETDATE()),
(3, 2, 'venta', 30, 25.50, GETDATE()),
(4, 3, 'liquidacion', 50, 15.10, GETDATE());

-- Evento Admin (solo tipos válidos del CHECK)
INSERT INTO [dbo].[evento_admin] (id_usuario, id_admin, tipo, justificacion, fecha) VALUES
(2, 1, 'deshabilitar', 'Actividad sospechosa detectada', GETDATE()),
(3, 1, 'delistar', 'Empresa removida por baja liquidez', GETDATE()),
(4, 1, 'liquidar', 'Liquidación solicitada por el usuario', GETDATE());


SELECT
  t.id_tx AS id_transaccion,
  t.tipo,
  t.cantidad,
  t.precio,
  (t.cantidad * t.precio) AS total,
  t.fecha,
  e.nombre AS empresa_nombre,
  m.nombre AS mercado_nombre
FROM transaccion t
JOIN usuario u ON t.id_usuario = u.id_usuario
JOIN empresa e ON t.id_empresa = e.id_empresa
JOIN mercado m ON e.id_mercado = m.id_mercado
WHERE u.alias = 'trader01'
ORDER BY t.fecha DESC;
