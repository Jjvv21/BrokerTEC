USE BrokerTEC;

/* Función para calcular el máximo de acciones comprables por un usuario en una empresa específica.*/

DELIMITER //

CREATE FUNCTION FN_GetMaxBuyableShares(
    user_id INT,
    company_id INT
) RETURNS BIGINT
DETERMINISTIC
BEGIN
    DECLARE user_balance DECIMAL(18,2);
    DECLARE current_price DECIMAL(18,4);
    DECLARE available_shares BIGINT;
    DECLARE max_buyable BIGINT;
    DECLARE is_company_active BOOLEAN;
    DECLARE is_market_enabled BOOLEAN;

    -- Obtener saldo del wallet
    SELECT saldo INTO user_balance
    FROM wallet
    WHERE id_usuario = user_id;

    -- Verificar si el usuario tiene wallet
    IF user_balance IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Usuario no tiene wallet';
    END IF;

    -- Obtener precio actual y estado de la empresa
    SELECT precio_actual, activo INTO current_price, is_company_active
    FROM empresa
    WHERE id_empresa = company_id;

    -- Verificar si la empresa existe y está activa
    IF current_price IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Empresa no encontrada';
    END IF;
    IF is_company_active = FALSE THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Empresa no activa';
    END IF;

    -- Verificar si el precio es válido
    IF current_price <= 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Precio inválido';
    END IF;

    -- Verificar si el mercado está habilitado para el usuario
    SELECT COUNT(*) INTO is_market_enabled
    FROM usuario_mercado um
    JOIN empresa e ON um.id_mercado = e.id_mercado
    WHERE um.id_usuario = user_id
    AND e.id_empresa = company_id
    AND EXISTS (SELECT 1 FROM mercado m WHERE m.id_mercado = e.id_mercado AND m.estado = 'habilitado');

    IF is_market_enabled = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Mercado no habilitado';
    END IF;

    -- Obtener acciones disponibles en Tesorería
    SELECT acciones_disponibles INTO available_shares
    FROM tesoreria
    WHERE id_empresa = company_id;

    -- Verificar si hay acciones disponibles
    IF available_shares IS NULL OR available_shares = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Inventario insuficiente';
    END IF;

    -- Calcular máximo comprable: MIN(FLOOR(saldo / precio_actual), acciones_disponibles)
    SET max_buyable = LEAST(FLOOR(user_balance / current_price), available_shares);

    RETURN max_buyable;
END //

DELIMITER ;


/* Función para calcular el total de recargas realizadas por un usuario Trader en el día actual.*/

DELIMITER //

CREATE FUNCTION FN_GetDailyRechargeUsed(
    user_id INT
) RETURNS DECIMAL(18,2)
DETERMINISTIC
BEGIN
    DECLARE is_trader BOOLEAN;
    DECLARE wallet_exists BOOLEAN;
    DECLARE daily_total DECIMAL(18,2);

    -- Verificar si el usuario es Trader
    SELECT COUNT(*) INTO is_trader
    FROM usuario u
    JOIN rol r ON u.id_rol = r.id_rol
    WHERE u.id_usuario = user_id
    AND r.nombre_rol = 'Trader';

    IF is_trader = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Usuario no es Trader';
    END IF;

    -- Verificar si el usuario tiene wallet
    SELECT COUNT(*) INTO wallet_exists
    FROM wallet
    WHERE id_usuario = user_id;

    IF wallet_exists = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Usuario no tiene wallet';
    END IF;

    -- Calcular la suma de recargas del día actual
    SELECT COALESCE(SUM(monto), 0.00) INTO daily_total
    FROM recarga r
    JOIN wallet w ON r.id_wallet = w.id_wallet
    WHERE w.id_usuario = user_id
    AND DATE(r.fecha) = CURDATE();

    RETURN daily_total;
END //

DELIMITER ;

/* Función para calcular el valor total del portafolio de un usuario Trader.*/

DELIMITER //

CREATE FUNCTION FN_GetPortfolioValue(
    user_id INT
) RETURNS DECIMAL(18,2)
DETERMINISTIC
BEGIN
    DECLARE is_trader BOOLEAN;
    DECLARE wallet_exists BOOLEAN;
    DECLARE portfolio_value DECIMAL(18,2);

    -- Verificar si el usuario es Trader
    SELECT COUNT(*) INTO is_trader
    FROM usuario u
    JOIN rol r ON u.id_rol = r.id_rol
    WHERE u.id_usuario = user_id
    AND r.nombre_rol = 'Trader';

    IF is_trader = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Usuario no es Trader';
    END IF;

    -- Verificar si el usuario tiene wallet
    SELECT COUNT(*) INTO wallet_exists
    FROM wallet
    WHERE id_usuario = user_id;

    IF wallet_exists = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Usuario no tiene wallet';
    END IF;

    -- Calcular el valor total del portafolio
    SELECT COALESCE(SUM(p.cantidad * e.precio_actual), 0.00) INTO portfolio_value
    FROM portafolio p
    JOIN empresa e ON p.id_empresa = e.id_empresa
    WHERE p.id_usuario = user_id
    AND e.activo = TRUE;

    RETURN portfolio_value;
END //

DELIMITER ;


/* Función para obtener el alias del mayor tenedor de acciones de una empresa específica.*/

DELIMITER //

CREATE FUNCTION FN_GetTopHolderAlias(
    company_id INT
) RETURNS VARCHAR(50)
DETERMINISTIC
BEGIN
    DECLARE is_company_active BOOLEAN;
    DECLARE max_trader_shares BIGINT;
    DECLARE treasury_shares BIGINT;
    DECLARE top_holder_alias VARCHAR(50);

    -- Verificar si la empresa existe y está activa
    SELECT activo INTO is_company_active
    FROM empresa
    WHERE id_empresa = company_id
    LIMIT 1;

    IF is_company_active IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Empresa no encontrada';
    END IF;

    IF is_company_active = FALSE THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Empresa no activa';
    END IF;

    -- Obtener la cantidad máxima de acciones en portafolio (por Trader)
    SELECT COALESCE(MAX(cantidad), 0) INTO max_trader_shares
    FROM portafolio
    WHERE id_empresa = company_id;

    -- Obtener las acciones disponibles en Tesorería
    SELECT COALESCE(acciones_disponibles, 0) INTO treasury_shares
    FROM tesoreria
    WHERE id_empresa = company_id
    LIMIT 1;

    -- Determinar el mayor tenedor
    IF treasury_shares >= max_trader_shares THEN
        RETURN 'administracion';
    ELSE
        -- Obtener el alias del Trader con más acciones
        SELECT u.alias INTO top_holder_alias
        FROM portafolio p
        JOIN usuario u ON p.id_usuario = u.id_usuario
        WHERE p.id_empresa = company_id
        AND p.cantidad = max_trader_shares
        LIMIT 1;

        RETURN top_holder_alias;
    END IF;
END //

DELIMITER ;


/* Función para calcular la variación porcentual del precio de una empresa respecto a su último precio registrado.*/
DELIMITER //

CREATE FUNCTION FN_GetPriceVariation(
    company_id INT
) RETURNS DECIMAL(10,2)
DETERMINISTIC
BEGIN
    DECLARE is_company_active BOOLEAN;
    DECLARE current_price DECIMAL(18,4);
    DECLARE previous_price DECIMAL(18,4);
    DECLARE price_variation DECIMAL(10,2);

    -- Verificar si la empresa existe y está activa
    SELECT activo, precio_actual INTO is_company_active, current_price
    FROM empresa
    WHERE id_empresa = company_id
    LIMIT 1;

    IF is_company_active IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Empresa no encontrada';
    END IF;

    IF is_company_active = FALSE THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Empresa no activa';
    END IF;

    IF current_price <= 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Precio actual inválido';
    END IF;

    -- Obtener el precio anterior inmediato de historico_precio
    SELECT precio INTO previous_price
    FROM historico_precio
    WHERE id_empresa = company_id
    ORDER BY fecha DESC
    LIMIT 1;

    -- Calcular la variación porcentual
    IF previous_price IS NULL OR previous_price = 0 THEN
        SET price_variation = 0.00;
    ELSE
        SET price_variation = ((current_price - previous_price) / previous_price) * 100.00;
    END IF;

    RETURN price_variation;
END //

DELIMITER ;

/* Función para calcular el porcentaje de acciones de una empresa que están en manos de Traders.*/
DELIMITER //

CREATE FUNCTION FN_GetHoldingsDistribution(
    company_id INT
) RETURNS DECIMAL(5,2)
DETERMINISTIC
BEGIN
    DECLARE is_company_active BOOLEAN;
    DECLARE total_shares BIGINT;
    DECLARE traders_shares BIGINT;
    DECLARE traders_pct DECIMAL(5,2);

    -- Verificar si la empresa existe y está activa
    SELECT activo, cantidad_acciones INTO is_company_active, total_shares
    FROM empresa
    WHERE id_empresa = company_id
    LIMIT 1;

    IF is_company_active IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Empresa no encontrada';
    END IF;

    IF is_company_active = FALSE THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Empresa no activa';
    END IF;

    IF total_shares <= 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Cantidad de acciones inválida';
    END IF;

    -- Sumar las acciones de Traders en portafolio para esta empresa
    SELECT COALESCE(SUM(cantidad), 0) INTO traders_shares
    FROM portafolio
    WHERE id_empresa = company_id;

    -- Calcular el porcentaje de Traders
    SET traders_pct = (traders_shares / total_shares) * 100.00;

    RETURN traders_pct;
END //

DELIMITER ;




