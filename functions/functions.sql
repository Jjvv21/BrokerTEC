USE BrokerTEC;
GO


IF OBJECT_ID('FN_GetMaxBuyableShares', 'FN') IS NOT NULL
    DROP FUNCTION FN_GetMaxBuyableShares;
GO


--- Función para calcular la cantidad máxima de acciones que un usuario puede comprar de una empresa específica
CREATE FUNCTION FN_GetMaxBuyableShares(
    @user_id INT,
    @company_id INT
) RETURNS BIGINT
AS
BEGIN
    DECLARE @user_balance DECIMAL(18,2);
    DECLARE @current_price DECIMAL(18,4);
    DECLARE @available_shares BIGINT;
    DECLARE @max_buyable BIGINT;
    DECLARE @is_company_active BIT;
    DECLARE @is_market_enabled INT;

    SELECT @user_balance = saldo
    FROM wallet
    WHERE id_usuario = @user_id;

    IF @user_balance IS NULL
        RETURN -1; -- Usuario no tiene wallet

    SELECT @current_price = precio_actual, @is_company_active = activo
    FROM empresa
    WHERE id_empresa = @company_id;

    IF @current_price IS NULL
        RETURN -2; -- Empresa no encontrada
    IF @is_company_active = 0
        RETURN -3; -- Empresa no activa
    IF @current_price <= 0
        RETURN -4; -- Precio inválido

    SELECT @is_market_enabled = COUNT(*)
    FROM usuario_mercado um
    INNER JOIN empresa e ON um.id_mercado = e.id_mercado
    WHERE um.id_usuario = @user_id
    AND e.id_empresa = @company_id
    AND EXISTS (SELECT 1 FROM mercado m WHERE m.id_mercado = e.id_mercado AND m.estado = 'habilitado');

    IF @is_market_enabled = 0
        RETURN -5; -- Mercado no habilitado

    SELECT @available_shares = acciones_disponibles
    FROM tesoreria
    WHERE id_empresa = @company_id;

    IF @available_shares IS NULL OR @available_shares = 0
        RETURN -6; -- Inventario insuficiente

    SET @max_buyable = CASE 
        WHEN FLOOR(@user_balance / @current_price) < @available_shares 
        THEN FLOOR(@user_balance / @current_price)
        ELSE @available_shares
    END;

    RETURN @max_buyable;
END;
GO


IF OBJECT_ID('FN_GetDailyRechargeUsed', 'FN') IS NOT NULL
    DROP FUNCTION FN_GetDailyRechargeUsed;
GO
--- Función para calcular el monto total recargado por un usuario Trader en el día actual
CREATE FUNCTION FN_GetDailyRechargeUsed(
    @user_id INT
) RETURNS DECIMAL(18,2)
AS
BEGIN
    DECLARE @is_trader INT;
    DECLARE @wallet_exists INT;
    DECLARE @daily_total DECIMAL(18,2);

    -- Verificar si el usuario es Trader
    SELECT @is_trader = COUNT(*)
    FROM usuario u
    INNER JOIN rol r ON u.id_rol = r.id_rol
    WHERE u.id_usuario = @user_id
    AND r.nombre_rol = 'Trader';

    IF @is_trader = 0
        RETURN -1; -- Usuario no es Trader

    -- Verificar si el usuario tiene wallet
    SELECT @wallet_exists = COUNT(*)
    FROM wallet
    WHERE id_usuario = @user_id;

    IF @wallet_exists = 0
        RETURN -2; -- Usuario no tiene wallet

    -- Calcular la suma de recargas del día actual
    SELECT @daily_total = COALESCE(SUM(monto), 0.00)
    FROM recarga r
    INNER JOIN wallet w ON r.id_wallet = w.id_wallet
    WHERE w.id_usuario = @user_id
    AND CAST(r.fecha AS DATE) = CAST(GETDATE() AS DATE);

    RETURN @daily_total;
END;
GO

IF OBJECT_ID('FN_GetPortfolioValue', 'FN') IS NOT NULL
    DROP FUNCTION FN_GetPortfolioValue;

GO
--- Funcion para calcular el valor total del portafolio de un usuario Trader
CREATE FUNCTION FN_GetPortfolioValue(
    @user_id INT
) RETURNS DECIMAL(18,2)
AS
BEGIN
    DECLARE @is_trader INT;
    DECLARE @wallet_exists INT;
    DECLARE @portfolio_value DECIMAL(18,2);

    -- Verificar si el usuario es Trader
    SELECT @is_trader = COUNT(*)
    FROM usuario u
    INNER JOIN rol r ON u.id_rol = r.id_rol
    WHERE u.id_usuario = @user_id
    AND r.nombre_rol = 'Trader';

    IF @is_trader = 0
        RETURN -1; -- Usuario no es Trader

    -- Verificar si el usuario tiene wallet
    SELECT @wallet_exists = COUNT(*)
    FROM wallet
    WHERE id_usuario = @user_id;

    IF @wallet_exists = 0
        RETURN -2; -- Usuario no tiene wallet

    -- Calcular el valor total del portafolio
    SELECT @portfolio_value = COALESCE(SUM(p.cantidad * e.precio_actual), 0.00)
    FROM portafolio p
    INNER JOIN empresa e ON p.id_empresa = e.id_empresa
    WHERE p.id_usuario = @user_id
    AND e.activo = 1;

    RETURN @portfolio_value;
END;
GO

IF OBJECT_ID('FN_GetTopHolderAlias', 'FN') IS NOT NULL
    DROP FUNCTION FN_GetTopHolderAlias;
GO
---- Función para obtener el alias del mayor tenedor de acciones de una empresa
CREATE FUNCTION FN_GetTopHolderAlias(
    @company_id INT
) RETURNS VARCHAR(50)
AS
BEGIN
    DECLARE @is_company_active BIT;
    DECLARE @max_trader_shares BIGINT;
    DECLARE @treasury_shares BIGINT;
    DECLARE @top_holder_alias VARCHAR(50);

    -- Verificar si la empresa existe y está activa
    SELECT TOP 1 @is_company_active = activo
    FROM empresa
    WHERE id_empresa = @company_id;

    IF @is_company_active IS NULL
        RETURN 'ERROR: Empresa no encontrada';

    IF @is_company_active = 0
        RETURN 'ERROR: Empresa no activa';

    -- Obtener la cantidad máxima de acciones en portafolio (por Trader)
    SELECT @max_trader_shares = COALESCE(MAX(cantidad), 0)
    FROM portafolio
    WHERE id_empresa = @company_id;

    -- Obtener las acciones disponibles en Tesorería
    SELECT TOP 1 @treasury_shares = COALESCE(acciones_disponibles, 0)
    FROM tesoreria
    WHERE id_empresa = @company_id;

    -- Determinar el mayor tenedor
    IF @treasury_shares >= @max_trader_shares
        RETURN 'administracion';
    ELSE
        -- Obtener el alias del Trader con más acciones
        SELECT TOP 1 @top_holder_alias = u.alias
        FROM portafolio p
        INNER JOIN usuario u ON p.id_usuario = u.id_usuario
        WHERE p.id_empresa = @company_id
        AND p.cantidad = @max_trader_shares
        ORDER BY u.alias; -- Para consistencia si hay empate

        RETURN @top_holder_alias;

    RETURN NULL;
END;
GO


IF OBJECT_ID('FN_GetPriceVariation', 'FN') IS NOT NULL
    DROP FUNCTION FN_GetPriceVariation;
GO
--- Función para calcular la variación porcentual del precio de una empresa respecto a su precio anterior inmediato

CREATE FUNCTION FN_GetPriceVariation(
    @company_id INT
) RETURNS DECIMAL(10,2)
AS
BEGIN
    DECLARE @is_company_active BIT;
    DECLARE @current_price DECIMAL(18,4);
    DECLARE @previous_price DECIMAL(18,4);
    DECLARE @price_variation DECIMAL(10,2);

    -- Verificar si la empresa existe y está activa
    SELECT TOP 1 @is_company_active = activo, @current_price = precio_actual
    FROM empresa
    WHERE id_empresa = @company_id;

    IF @is_company_active IS NULL
        RETURN -999.99; -- Código de error: Empresa no encontrada

    IF @is_company_active = 0
        RETURN -888.88; -- Código de error: Empresa no activa

    IF @current_price <= 0
        RETURN -777.77; -- Código de error: Precio actual inválido

    -- Obtener el precio anterior inmediato de historico_precio
    SELECT TOP 1 @previous_price = precio
    FROM historico_precio
    WHERE id_empresa = @company_id
    ORDER BY fecha DESC;

    -- Calcular la variación porcentual
    IF @previous_price IS NULL OR @previous_price = 0
        SET @price_variation = 0.00;
    ELSE
        SET @price_variation = ((@current_price - @previous_price) / @previous_price) * 100.00;

    RETURN @price_variation;
END;
GO


IF OBJECT_ID('FN_GetHoldingsDistribution', 'FN') IS NOT NULL
    DROP FUNCTION FN_GetHoldingsDistribution;
GO
--- Función para calcular el porcentaje de acciones en manos de Traders vs Tesorería para una empresa

CREATE FUNCTION FN_GetHoldingsDistribution(
    @company_id INT
) RETURNS DECIMAL(5,2)
AS
BEGIN
    DECLARE @is_company_active BIT;
    DECLARE @total_shares BIGINT;
    DECLARE @traders_shares BIGINT;
    DECLARE @traders_pct DECIMAL(5,2);

    -- Verificar si la empresa existe y está activa
    SELECT TOP 1 @is_company_active = activo, @total_shares = cantidad_acciones
    FROM empresa
    WHERE id_empresa = @company_id;

    IF @is_company_active IS NULL
        RETURN -1.00; -- Código de error: Empresa no encontrada

    IF @is_company_active = 0
        RETURN -2.00; -- Código de error: Empresa no activa

    IF @total_shares <= 0
        RETURN -3.00; -- Código de error: Cantidad de acciones inválida

    -- Sumar las acciones de Traders en portafolio para esta empresa
    SELECT @traders_shares = COALESCE(SUM(cantidad), 0)
    FROM portafolio
    WHERE id_empresa = @company_id;

    -- Calcular el porcentaje de Traders
    SET @traders_pct = (CAST(@traders_shares AS DECIMAL(18,2)) / @total_shares) * 100.00;

    RETURN @traders_pct;
END;
GO


-- Función para obtener el precio actual de una empresa
IF OBJECT_ID('FN_ObtenerPrecioActual', 'FN') IS NOT NULL
    DROP FUNCTION FN_ObtenerPrecioActual;
GO

CREATE FUNCTION FN_ObtenerPrecioActual(
    @company_id INT
) RETURNS DECIMAL(18,4)
AS
BEGIN
    DECLARE @current_price DECIMAL(18,4);
    DECLARE @is_company_active BIT;

    SELECT @current_price = precio_actual, @is_company_active = activo
    FROM empresa
    WHERE id_empresa = @company_id;

    IF @is_company_active IS NULL
        RETURN -1; -- Empresa no encontrada

    IF @is_company_active = 0
        RETURN -2; -- Empresa no activa

    RETURN @current_price;
END;
GO

-- Función para calcular la capitalización de mercado de una empresa
IF OBJECT_ID('FN_CalcularCapitalizacionMercado', 'FN') IS NOT NULL
    DROP FUNCTION FN_CalcularCapitalizacionMercado;
GO

CREATE FUNCTION FN_CalcularCapitalizacionMercado(
    @company_id INT
) RETURNS DECIMAL(18,2)
AS
BEGIN
    DECLARE @current_price DECIMAL(18,4);
    DECLARE @total_shares BIGINT;
    DECLARE @is_company_active BIT;
    DECLARE @capitalization DECIMAL(18,2);

    SELECT @current_price = precio_actual, @total_shares = cantidad_acciones, @is_company_active = activo
    FROM empresa
    WHERE id_empresa = @company_id;

    IF @is_company_active IS NULL
        RETURN -1; -- Empresa no encontrada

    IF @is_company_active = 0
        RETURN -2; -- Empresa no activa

    IF @current_price <= 0 OR @total_shares <= 0
        RETURN -3; -- Datos inválidos

    SET @capitalization = @current_price * @total_shares;

    RETURN @capitalization;
END;
GO

-- Función para calcular las acciones disponibles en Tesorería para una empresa
IF OBJECT_ID('FN_CalcularAccionesTesoro', 'FN') IS NOT NULL
    DROP FUNCTION FN_CalcularAccionesTesoro;
GO

CREATE FUNCTION FN_CalcularAccionesTesoro(
    @company_id INT
) RETURNS BIGINT
AS
BEGIN
    DECLARE @total_shares BIGINT;
    DECLARE @traders_shares BIGINT;
    DECLARE @available_shares BIGINT;
    DECLARE @is_company_active BIT;

    SELECT @total_shares = cantidad_acciones, @is_company_active = activo
    FROM empresa
    WHERE id_empresa = @company_id;

    IF @is_company_active IS NULL
        RETURN -1; -- Empresa no encontrada

    IF @is_company_active = 0
        RETURN -2; -- Empresa no activa

    SELECT @traders_shares = COALESCE(SUM(cantidad), 0)
    FROM portafolio
    WHERE id_empresa = @company_id;

    SET @available_shares = @total_shares - @traders_shares;

    RETURN @available_shares;
END;
GO

-- Función para calcular el valor actual de una posición específica de un usuario en una empresa
IF OBJECT_ID('FN_CalcularValorPosicion', 'FN') IS NOT NULL
    DROP FUNCTION FN_CalcularValorPosicion;
GO

CREATE FUNCTION FN_CalcularValorPosicion(
    @user_id INT,
    @company_id INT
) RETURNS DECIMAL(18,2)
AS
BEGIN
    DECLARE @quantity BIGINT;
    DECLARE @current_price DECIMAL(18,4);
    DECLARE @position_value DECIMAL(18,2);
    DECLARE @is_company_active BIT;

    SELECT @quantity = cantidad
    FROM portafolio
    WHERE id_usuario = @user_id AND id_empresa = @company_id;

    IF @quantity IS NULL
        RETURN 0.00; -- No hay posición

    SELECT @current_price = precio_actual, @is_company_active = activo
    FROM empresa
    WHERE id_empresa = @company_id;

    IF @is_company_active IS NULL OR @is_company_active = 0
        RETURN -1; -- Empresa no encontrada o no activa

    SET @position_value = @quantity * @current_price;

    RETURN @position_value;
END;
GO

-- Función para obtener las top N empresas por capitalización en un mercado (función de tabla)
IF OBJECT_ID('FN_ObtenerTopEmpresasPorCap', 'TF') IS NOT NULL
    DROP FUNCTION FN_ObtenerTopEmpresasPorCap;
GO

DROP FUNCTION IF EXISTS FN_ObtenerTopEmpresasPorCap;
GO

CREATE FUNCTION FN_ObtenerTopEmpresasPorCap(
    @market_id INT,
    @top_n INT
) RETURNS TABLE
AS
RETURN
(
    SELECT TOP (@top_n) 
        e.id_empresa, 
        e.nombre,
        (e.precio_actual * e.cantidad_acciones) AS capitalizacion
    FROM empresa e
    INNER JOIN mercado m ON e.id_mercado = m.id_mercado
    WHERE m.id_mercado = @market_id 
        AND e.activo = 1 
        AND m.estado = 'habilitado'
    ORDER BY capitalizacion DESC
);
GO

-- Función para obtener los top N traders por saldo en wallet (función de tabla)
IF OBJECT_ID('FN_ObtenerTopTradersPorWallet', 'TF') IS NOT NULL
    DROP FUNCTION FN_ObtenerTopTradersPorWallet;
GO

DROP FUNCTION IF EXISTS FN_ObtenerTopTradersPorWallet;
GO

CREATE FUNCTION FN_ObtenerTopTradersPorWallet(
    @top_n INT
) RETURNS TABLE
AS
RETURN
(
    SELECT TOP (@top_n) 
        u.alias, 
        w.saldo
    FROM usuario u
    INNER JOIN wallet w ON u.id_usuario = w.id_usuario
    INNER JOIN rol r ON u.id_rol = r.id_rol
    WHERE r.nombre_rol = 'Trader' 
        AND u.estado = 1
    ORDER BY w.saldo DESC
);
GO

-- Función para obtener los top N traders por valor total en portafolio (función de tabla)
IF OBJECT_ID('FN_ObtenerTopTradersPorValorPortafolio', 'TF') IS NOT NULL
    DROP FUNCTION FN_ObtenerTopTradersPorValorPortafolio;
GO
DROP FUNCTION IF EXISTS FN_ObtenerTopTradersPorValorPortafolio;
GO

CREATE FUNCTION FN_ObtenerTopTradersPorValorPortafolio(
    @top_n INT
) RETURNS TABLE
AS
RETURN
(
    SELECT TOP (@top_n) 
        u.alias,
        COALESCE(SUM(p.cantidad * e.precio_actual), 0.00) AS valor_portafolio
    FROM usuario u
    INNER JOIN rol r ON u.id_rol = r.id_rol
    LEFT JOIN portafolio p ON u.id_usuario = p.id_usuario
    LEFT JOIN empresa e ON p.id_empresa = e.id_empresa
    WHERE r.nombre_rol = 'Trader' 
        AND u.estado = 1 
        AND (e.activo = 1 OR e.activo IS NULL)
    GROUP BY u.id_usuario, u.alias
    ORDER BY valor_portafolio DESC
);
GO

-- Función para obtener el historial de precios de una empresa (función de tabla)
IF OBJECT_ID('FN_ObtenerHistorialPrecios', 'TF') IS NOT NULL
    DROP FUNCTION FN_ObtenerHistorialPrecios;
GO

DROP FUNCTION IF EXISTS FN_ObtenerHistorialPrecios;
GO

CREATE FUNCTION FN_ObtenerHistorialPrecios(
    @company_id INT
) RETURNS TABLE
AS
RETURN
(
    SELECT 
        precio, 
        fecha
    FROM historico_precio
    WHERE id_empresa = @company_id
);
GO

-- Función para obtener el historial de transacciones por empresa (función de tabla)
IF OBJECT_ID('FN_ObtenerTransaccionesEmpresa', 'TF') IS NOT NULL
    DROP FUNCTION FN_ObtenerTransaccionesEmpresa;
GO

DROP FUNCTION IF EXISTS FN_ObtenerTransaccionesEmpresa;
GO

CREATE FUNCTION FN_ObtenerTransaccionesEmpresa(
    @company_id INT,
    @fecha_desde DATE,
    @fecha_hasta DATE
) RETURNS TABLE
AS
RETURN
(
    SELECT 
        u.alias, 
        t.tipo, 
        t.cantidad, 
        t.precio, 
        t.fecha
    FROM transaccion t
    INNER JOIN usuario u ON t.id_usuario = u.id_usuario
    WHERE t.id_empresa = @company_id
        AND CAST(t.fecha AS DATE) BETWEEN @fecha_desde AND @fecha_hasta
);
GO

-- Función para obtener el historial de transacciones por alias de usuario (función de tabla)
IF OBJECT_ID('FN_ObtenerTransaccionesUsuario', 'TF') IS NOT NULL
    DROP FUNCTION FN_ObtenerTransaccionesUsuario;
GO

DROP FUNCTION IF EXISTS FN_ObtenerTransaccionesUsuario;
GO

CREATE FUNCTION FN_ObtenerTransaccionesUsuario(
    @alias VARCHAR(50),
    @fecha_desde DATE,
    @fecha_hasta DATE
) RETURNS TABLE
AS
RETURN
(
    SELECT 
        e.nombre AS empresa, 
        t.tipo, 
        t.cantidad, 
        t.precio, 
        t.fecha
    FROM transaccion t
    INNER JOIN usuario u ON t.id_usuario = u.id_usuario
    INNER JOIN empresa e ON t.id_empresa = e.id_empresa
    WHERE u.alias = @alias
        AND CAST(t.fecha AS DATE) BETWEEN @fecha_desde AND @fecha_hasta
);
GO

-- Función para obtener estadísticas de tenencia (porcentajes) por empresa o mercado (función de tabla)
IF OBJECT_ID('FN_ObtenerEstadisticasTenencia', 'TF') IS NOT NULL
    DROP FUNCTION FN_ObtenerEstadisticasTenencia;
GO

DROP FUNCTION IF EXISTS FN_ObtenerEstadisticasTenencia;
GO

CREATE FUNCTION FN_ObtenerEstadisticasTenencia(
    @id INT,  -- id_empresa o id_mercado
    @tipo VARCHAR(10)  -- 'empresa' o 'mercado'
)
RETURNS TABLE
AS
RETURN
(
    WITH AccionesTraders AS (
        SELECT 
            e.id_empresa,
            e.id_mercado,
            SUM(p.cantidad) AS traders_acciones
        FROM empresa e
        LEFT JOIN portafolio p ON p.id_empresa = e.id_empresa
        WHERE 
            (@tipo = 'empresa' AND e.id_empresa = @id)
            OR (@tipo = 'mercado' AND e.id_mercado = @id)
        GROUP BY e.id_empresa, e.id_mercado
    ),
    Totales AS (
        SELECT
            CASE
                WHEN @tipo = 'empresa' THEN e.id_empresa
                ELSE e.id_mercado
            END AS agrupador,
            SUM(e.cantidad_acciones) AS total_acciones,
            SUM(COALESCE(a.traders_acciones, 0)) AS traders_acciones
        FROM empresa e
        LEFT JOIN AccionesTraders a ON a.id_empresa = e.id_empresa
        WHERE 
            (@tipo = 'empresa' AND e.id_empresa = @id)
            OR (@tipo = 'mercado' AND e.id_mercado = @id)
            AND e.activo = 1
        GROUP BY CASE 
                    WHEN @tipo = 'empresa' THEN e.id_empresa 
                    ELSE e.id_mercado 
                 END
    )
    SELECT
        agrupador,
        (traders_acciones * 100.0 / NULLIF(total_acciones, 0)) AS pct_traders,
        (100.0 - (traders_acciones * 100.0 / NULLIF(total_acciones, 0))) AS pct_admin
    FROM Totales
);
GO

-- Ejemplos de uso de las funciones

SELECT dbo.FN_GetMaxBuyableShares(2, 1) AS MaxBuyableShares;  -- Ejemplo de uso
SELECT dbo.FN_GetDailyRechargeUsed(4) AS DailyRechargeUsed;   -- Ej
SELECT dbo.FN_GetPortfolioValue(2) AS ValorPortafolio;
SELECT dbo.FN_GetTopHolderAlias(3) AS MayorTenedor;
SELECT dbo.FN_GetPriceVariation(1) AS VariacionPrecio;
SELECT dbo.FN_GetHoldingsDistribution(1) AS DistribucionTenedores;
SELECT dbo.FN_ObtenerPrecioActual(1) AS PrecioActual;
SELECT dbo.FN_CalcularCapitalizacionMercado(1) AS Capitalizacion;
SELECT dbo.FN_CalcularAccionesTesoro(1) AS AccionesTesoro;
SELECT dbo.FN_CalcularValorPosicion(2, 1) AS ValorPosicion;

-- Probar funciones de tabla
SELECT * FROM dbo.FN_ObtenerTopEmpresasPorCap(1, 5);
SELECT * FROM dbo.FN_ObtenerTopTradersPorWallet(3);
SELECT * FROM dbo.FN_ObtenerTopTradersPorValorPortafolio(3);
SELECT * FROM dbo.FN_ObtenerHistorialPrecios(1);
SELECT * FROM dbo.FN_ObtenerTransaccionesEmpresa(1, '2024-01-01', GETDATE());
SELECT * FROM dbo.FN_ObtenerTransaccionesUsuario('trader01', '2024-01-01', GETDATE());
SELECT * FROM dbo.FN_ObtenerEstadisticasTenencia(1, 'empresa');
SELECT * FROM dbo.FN_ObtenerEstadisticasTenencia(1, 'mercado');

