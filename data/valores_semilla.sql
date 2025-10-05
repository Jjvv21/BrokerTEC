-- Script de reinicio e inserción de datos robustos para la base de datos BrokerTec
USE BrokerTEC;  

-- ==========================================
-- 0. REINICIO DE BASE DE DATOS (TRUNCATE)
-- ==========================================

-- Desactivar temporalmente las restricciones de claves foráneas para permitir TRUNCATE
SET FOREIGN_KEY_CHECKS = 0;

-- TRUNCATE TABLE para vaciar y reiniciar AUTO_INCREMENT en el orden que funcione mejor
TRUNCATE TABLE transaccion;
TRUNCATE TABLE evento_admin;
TRUNCATE TABLE historico_precio;
TRUNCATE TABLE portafolio;
TRUNCATE TABLE recarga;
TRUNCATE TABLE wallet;
TRUNCATE TABLE usuario_mercado;
TRUNCATE TABLE tesoreria;
TRUNCATE TABLE empresa;
TRUNCATE TABLE mercado;
TRUNCATE TABLE usuario;
TRUNCATE TABLE categoria;
TRUNCATE TABLE rol;

-- Volver a activar las restricciones de claves foráneas
SET FOREIGN_KEY_CHECKS = 1;


-- ==========================================
-- 1. Roles (Sin cambios)
-- ==========================================
INSERT INTO rol (nombre_rol, descripcion)
VALUES 
  ('Admin', 'Administrador del sistema'),
  ('Trader', 'Usuario con permisos para operar en mercados'),
  ('Analyst', 'Analista con acceso a información de mercado');

-- ==========================================
-- 2. Categorías (Sin cambios)
-- ==========================================
INSERT INTO categoria (nombre_categoria, limite_diario)
VALUES
  ('Junior', 10000.00),
  ('Mid', 50000.00),
  ('Senior', 200000.00);

-- ==========================================
-- 3. Mercados (Más mercados)
-- ==========================================
INSERT INTO mercado (nombre, estado)
VALUES
  ( 'NYSE', 'habilitado'),
  ( 'NASDAQ', 'habilitado'),
  ( 'BME', 'deshabilitado'),
  ( 'TOKYO', 'habilitado'),
  ( 'FRANKFURT', 'habilitado');

-- ==========================================
-- 4. Usuarios (Más traders y analistas)
-- ==========================================
INSERT INTO usuario (id_rol, id_categoria, alias, nombre, correo, telefono, direccion, pais_de_origen, password_hash)
VALUES
  -- ADMINS
  (1, 3, 'admin_master', 'Admin General', 'admin@brokertec.com', '1111-1111', 'Av. Central 101', 'Costa Rica', 'hash_admin'),
  -- TRADERS
  (2, 2, 'trader_julio', 'Julio Vega', 'julio@brokertec.com', '2222-2222', 'Calle 5', 'Costa Rica', 'hash_trader_julio'),
  (2, 1, 'trader_ana', 'Ana Gómez', 'ana@brokertec.com', '4444-4444', 'Calle 10', 'México', 'hash_trader_ana'),
  (2, 3, 'trader_senior', 'Carlos Ruiz', 'carlos@brokertec.com', '5555-5555', 'Bvd. Libertad', 'Chile', 'hash_trader_carlos'),
  (2, 2, 'trader_medio', 'Sofia Diaz', 'sofia@brokertec.com', '6666-6666', 'Paseo Marítimo', 'España', 'hash_trader_sofia'),
  (2, 1, 'trader_novato', 'Pedro Pineda', 'pedro@brokertec.com', '7777-7777', 'Cra. 50', 'Colombia', 'hash_trader_pedro'),
  -- ANALYSTS
  (3, 1, 'analyst_maria', 'María López', 'maria@brokertec.com', '3333-3333', 'Av. Segunda', 'España', 'hash_analyst_maria'),
  (3, 3, 'analyst_senior', 'Elena Faro', 'elena@brokertec.com', '8888-8888', 'Ronda Central', 'Perú', 'hash_analyst_elena');

-- ==========================================
-- 5. Empresas (Más empresas en varios mercados)
-- ==========================================
INSERT INTO empresa (id_mercado, nombre, precio_actual, cantidad_acciones, activo)
VALUES
  -- NYSE (id_mercado 1)
  (1, 'TechNova', 120.50, 1000000, TRUE), 
  (1, 'FinCorp', 50.00, 500000, TRUE),   
  (1, 'SteelMax', 30.75, 2000000, TRUE),    
  -- NASDAQ (id_mercado 2)
  (2, 'GreenPower', 85.25, 750000, TRUE), -- id_empresa 4
  (2, 'CloudNet', 250.00, 400000, TRUE), -- id_empresa 5
  -- TOKYO (id_mercado 4)
  (4, 'AquaTech', 15.10, 5000000, TRUE), -- id_empresa 6
  -- FRANKFURT (id_mercado 5)
  (5, 'AutoMotion', 95.90, 800000, TRUE), -- id_empresa 7
  -- NYSE (id_mercado 1)
  (1, 'GainCorp', 150.00, 100000, TRUE),   
  (1, 'LossTech', 90.00, 100000, TRUE),    
  (1, 'StableCo', 75.00, 100000, TRUE),    
  (1, 'NewStart', 50.00, 100000, TRUE),    
  (1, 'FalloCorp', 20.00, 100000, TRUE),    
  (1, 'Delisted', 10.00, 100000, FALSE);
-- ==========================================
-- 6. Tesorería (Acciones disponibles para todas las empresas)
-- ==========================================
INSERT INTO tesoreria (id_empresa, acciones_disponibles)
VALUES
  (1, 200000),
  (2, 300000),
  (3, 1000000),
  (4, 150000),
  (5, 50000),
  (6, 2500000),
  (7, 400000);

-- ==========================================
-- 7. Usuario-Mercado (Más permisos de mercado)
-- ==========================================
INSERT INTO usuario_mercado (id_usuario, id_mercado)
VALUES
  -- Julio (ID 2)
  (2, 1), (2, 2),
  -- Ana (ID 3)
  (3, 1), 
  -- Carlos (ID 4) - Todos los mercados habilitados
  (4, 1), (4, 2), (4, 4), (4, 5),
  -- Sofia (ID 5)
  (5, 4),
  -- Pedro (ID 6)
  (6, 5),
  -- Maria (Analista ID 7)
  (7, 1);

-- ==========================================
-- 8. Wallets (Saldos iniciales para todos los usuarios)
-- ==========================================
INSERT INTO wallet (id_usuario, saldo)
VALUES
  (1, 0.00), -- Admin
  (2, 50000.00),   -- Julio
  (3, 10000.00),   -- Ana
  (4, 250000.00),  -- Carlos (Senior)
  (5, 75000.00),   -- Sofia
  (6, 5000.00),    -- Pedro
  (7, 0.00),       -- Maria (Analyst)
  (8, 0.00);       -- Elena (Analyst)

-- ==========================================
-- 9. Recargas (Más recargas para probar límites diarios)
-- ==========================================
INSERT INTO recarga (id_wallet, monto, fecha)
VALUES
  -- JULIO (ID 2): Recarga A de hace 1 día 
  (2, 30000.00, DATE_SUB(NOW(), INTERVAL 1 DAY)), 
  
  -- JULIO (ID 2): Recarga B de hoy 
  (2, 10000.00, NOW()), 
  
  -- ANA (ID 3)
  (3, 5000.00, NOW()),  
  
  -- CARLOS (ID 4): Dos recargas de hoy para probar la suma diaria
  (4, 25000.00, NOW()), 
  (4, 15000.00, NOW()),
  
  -- SOFIA (ID 5)
  (5, 1000.00, NOW()); 


-- ==========================================
-- 10. Portafolios (Más posiciones iniciales)
-- ==========================================
INSERT INTO portafolio (id_usuario, id_empresa, id_mercado, cantidad, costo_promedio)
VALUES
  -- Julio (ID 2)
  (2, 1, 1, 100, 120.50), -- TechNova
  (2, 4, 2, 50, 85.25),   -- GreenPower
  -- Ana (ID 3)
  (3, 2, 1, 200, 50.00),  -- FinCorp
  -- Carlos (ID 4)
  (4, 5, 2, 500, 250.00), -- CloudNet (Alta capitalización)
  (4, 3, 1, 1000, 30.75); -- SteelMax

-- ==========================================
-- 11. Histórico de precios (Más registros y empresas)
-- ==========================================
INSERT INTO historico_precio (id_empresa, precio, fecha)
VALUES
  -- TechNova (ID 1)
  (1, 118.00, NOW() - INTERVAL 2 DAY),
  (1, 120.50, NOW() - INTERVAL 1 DAY),
  -- GreenPower (ID 4)
  (4, 84.00, NOW() - INTERVAL 3 DAY),
  -- FinCorp (ID 2)
  (2, 51.00, NOW()),
  -- CloudNet (ID 5) - Volatilidad
  (5, 240.00, NOW() - INTERVAL 5 DAY),
  (5, 250.00, NOW() - INTERVAL 1 DAY),
  (5, 255.00, NOW()),
  -- GainCorp (Precio anterior: 120.00)
  (8, 120.00, NOW() - INTERVAL 3 DAY),
  -- LossTech (Precio anterior: 100.00)
  (9, 100.00, NOW() - INTERVAL 1 DAY),
  -- StableCo (Precio anterior: 75.00)
  (10, 75.00, NOW() - INTERVAL 1 DAY);

-- ==========================================
-- 12. Transacciones (Más variedad de movimientos)
-- ==========================================
INSERT INTO transaccion (id_usuario, id_empresa, tipo, cantidad, precio)
VALUES
  (2, 1, 'compra', 100, 120.50),
  (2, 4, 'compra', 50, 85.25),
  (2, 1, 'venta', 20, 122.00), -- Venta de Julio
  (3, 2, 'compra', 200, 50.00),
  (4, 5, 'compra', 500, 250.00),
  (4, 3, 'compra', 1000, 30.75),
  (4, 5, 'venta', 100, 255.00); -- Venta de Carlos con ganancia

-- ==========================================
-- 13. Eventos administrativos (Más eventos)
-- ==========================================
INSERT INTO evento_admin (id_usuario, id_admin, tipo, justificacion)
VALUES
  (2, 1, 'deshabilitar', 'Actividad sospechosa antigua'), -- Deshabilitar Usuario
  (4, 1, 'liquidar', 'Trader senior liquida todo'),
  (5, 1, 'delistar', 'BME deshabilitado por riesgo'); -- Delistar