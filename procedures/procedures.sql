USE BrokerTEC;
GO

---Stored Procedures---
-- Eliminar el procedimiento si existe


IF OBJECT_ID('SP_CrearUsuario', 'P') IS NOT NULL
    DROP PROCEDURE SP_CrearUsuario;
GO


---Stored procedure para crear un usuario con validaciones y manejo de errores
CREATE PROCEDURE SP_CrearUsuario
    @nombre VARCHAR(100),
    @alias VARCHAR(50),
    @direccion VARCHAR(255),
    @pais VARCHAR(50),
    @telefono VARCHAR(15),
    @email VARCHAR(100),
    @contrasena VARCHAR(255),
    @rol VARCHAR(50),
    @categoria VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @id_rol INT, @id_categoria INT, @password_hash VARBINARY(64), @id_usuario INT;

    BEGIN TRY
        -- Validaciones básicas
        IF LEN(@nombre) < 2 
            THROW 50001, 'Nombre inválido: debe tener al menos 2 caracteres.', 1;
        
        IF @email NOT LIKE '%@%.%' 
            THROW 50002, 'Email inválido.', 1;

        -- Obtener IDs
        SELECT @id_rol = id_rol FROM rol WHERE nombre_rol = @rol;
        IF @id_rol IS NULL
            THROW 50003, 'Rol inválido.', 1;

        SELECT @id_categoria = id_categoria FROM categoria WHERE nombre_categoria = @categoria;
        IF @id_categoria IS NULL
            THROW 50004, 'Categoría inválida.', 1;

        -- Hash de la contraseña (SQL Server usa VARBINARY para HASHBYTES)
        SET @password_hash = HASHBYTES('SHA2_256', @contrasena);

        -- Insertar usuario
        INSERT INTO usuario (id_rol, id_categoria, alias, estado, nombre, correo, telefono, direccion, pais_de_origen, password_hash)
        VALUES (@id_rol, @id_categoria, @alias, 1, @nombre, @email, @telefono, @direccion, @pais, @password_hash);
        
        SET @id_usuario = SCOPE_IDENTITY();

        -- Inicializar wallet
        INSERT INTO wallet (id_usuario, saldo) VALUES (@id_usuario, 0);

        SELECT @id_usuario AS id_usuario_creado;
    END TRY
    BEGIN CATCH
        IF ERROR_NUMBER() IN (2627, 2601)  -- Unique violation
            THROW 50005, 'Alias o email ya existe.', 1;
        ELSE
            THROW;  -- Relanza el error original
    END CATCH
END;
GO




-- Eliminar el procedimiento si existe
IF OBJECT_ID('SP_ActualizarPerfilUsuario', 'P') IS NOT NULL
    DROP PROCEDURE SP_ActualizarPerfilUsuario;
GO

---Stored procedure para actualizar el perfil de un usuario con validaciones y manejo de errores
CREATE PROCEDURE SP_ActualizarPerfilUsuario
    @id_usuario INT,
    @nombre VARCHAR(100),
    @alias VARCHAR(50),
    @direccion VARCHAR(255),
    @pais VARCHAR(50),
    @telefono VARCHAR(15),
    @email VARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        -- Verificar existencia
        IF NOT EXISTS (SELECT 1 FROM usuario WHERE id_usuario = @id_usuario)
            THROW 50010, 'Usuario no existe.', 1;

        -- Verificar unicidad (excluyendo propio)
        IF EXISTS (SELECT 1 FROM usuario WHERE alias = @alias AND id_usuario != @id_usuario)
            THROW 50011, 'Alias ya existe.', 1;
            
        IF EXISTS (SELECT 1 FROM usuario WHERE correo = @email AND id_usuario != @id_usuario)
            THROW 50012, 'Email ya existe.', 1;

        -- Validación de email
        IF @email NOT LIKE '%@%.%'
            THROW 50013, 'Email inválido.', 1;

        -- Actualizar
        UPDATE usuario
        SET nombre = @nombre, 
            alias = @alias, 
            direccion = @direccion, 
            pais_de_origen = @pais,
            telefono = @telefono, 
            correo = @email
        WHERE id_usuario = @id_usuario;

        SELECT 'Perfil actualizado correctamente' AS Mensaje;
    END TRY
    BEGIN CATCH
        -- Relanzar el error con un mensaje más claro
        DECLARE @ErrorNumber INT = ERROR_NUMBER();
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        
        IF @ErrorNumber BETWEEN 50010 AND 50019
            THROW;
        ELSE
            THROW 50014, 'Error al actualizar perfil. Verifique los datos.', 1;
    END CATCH
END;
GO

-- 1. Procedimiento para cambiar contraseña
IF OBJECT_ID('SP_CambiarContraseña', 'P') IS NOT NULL
    DROP PROCEDURE SP_CambiarContraseña;
GO

CREATE PROCEDURE SP_CambiarContraseña
    @id_usuario INT,
    @nueva_contrasena VARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @password_hash VARBINARY(64);

    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM usuario WHERE id_usuario = @id_usuario)
            THROW 50020, 'Usuario no existe.', 1;
            
        IF LEN(@nueva_contrasena) < 6
            THROW 50021, 'Contraseña debe tener al menos 6 caracteres.', 1;

        SET @password_hash = HASHBYTES('SHA2_256', @nueva_contrasena);

        UPDATE usuario SET password_hash = @password_hash WHERE id_usuario = @id_usuario;
        
        SELECT 'Contraseña actualizada correctamente' AS Mensaje;
    END TRY
    BEGIN CATCH
        DECLARE @ErrorNumber INT = ERROR_NUMBER();
        IF @ErrorNumber BETWEEN 50020 AND 50029
            THROW;
        ELSE
            THROW 50022, 'Error al cambiar contraseña.', 1;
    END CATCH
END;
GO

-- 2. Procedimiento para deshabilitar usuario
IF OBJECT_ID('SP_DeshabilitarUsuario', 'P') IS NOT NULL
    DROP PROCEDURE SP_DeshabilitarUsuario;
GO

CREATE PROCEDURE SP_DeshabilitarUsuario
    @id_usuario INT,
    @justificacion TEXT,
    @id_admin INT
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @precio DECIMAL(18,4), @cantidad INT, @id_empresa INT;

    BEGIN TRY
        BEGIN TRANSACTION;

        IF NOT EXISTS (SELECT 1 FROM usuario WHERE id_usuario = @id_usuario AND estado = 1)
            THROW 50030, 'Usuario no existe o ya está deshabilitado.', 1;

        -- Liquidar portafolio: vender todo al precio actual
        DECLARE cur CURSOR FOR
            SELECT p.id_empresa, p.cantidad
            FROM portafolio p
            INNER JOIN empresa e ON p.id_empresa = e.id_empresa
            WHERE p.id_usuario = @id_usuario AND e.activo = 1;

        OPEN cur;
        FETCH NEXT FROM cur INTO @id_empresa, @cantidad;

        WHILE @@FETCH_STATUS = 0
        BEGIN
            SET @precio = dbo.FN_ObtenerPrecioActual(@id_empresa);

            -- Solo procesar si el precio es válido (mayor que 0)
            IF @precio > 0
            BEGIN
                -- Vender (simular via transaccion 'liquidacion')
                INSERT INTO transaccion (id_usuario, id_empresa, tipo, cantidad, precio) 
                VALUES (@id_usuario, @id_empresa, 'liquidacion', @cantidad, @precio);

                -- Actualizar wallet + , portafolio - , tesoreria +
                UPDATE w SET saldo = saldo + (@cantidad * @precio) 
                FROM wallet w 
                WHERE w.id_usuario = @id_usuario;
                
                UPDATE p SET cantidad = 0 
                FROM portafolio p 
                WHERE p.id_usuario = @id_usuario AND p.id_empresa = @id_empresa;
                
                UPDATE t SET acciones_disponibles = acciones_disponibles + @cantidad 
                FROM tesoreria t 
                WHERE t.id_empresa = @id_empresa;
            END

            FETCH NEXT FROM cur INTO @id_empresa, @cantidad;
        END;
        CLOSE cur; 
        DEALLOCATE cur;

        -- Deshabilitar usuario
        UPDATE usuario SET estado = 0 WHERE id_usuario = @id_usuario;

        -- Log
        INSERT INTO evento_admin (id_usuario, id_admin, tipo, justificacion) 
        VALUES (@id_usuario, @id_admin, 'deshabilitar', @justificacion);

        COMMIT TRANSACTION;
        
        SELECT 'Usuario deshabilitado y portafolio liquidado correctamente' AS Mensaje;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
            
        THROW 50031, 'Error al deshabilitar usuario.', 1;
    END CATCH
END;
GO


-- 3. Procedimiento para asignar categoría
IF OBJECT_ID('SP_AsignarCategoria', 'P') IS NOT NULL
    DROP PROCEDURE SP_AsignarCategoria;
GO

CREATE PROCEDURE SP_AsignarCategoria
    @id_usuario INT,
    @categoria VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @id_categoria INT;

    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM usuario WHERE id_usuario = @id_usuario)
            THROW 50040, 'Usuario no existe.', 1;

        SELECT @id_categoria = id_categoria FROM categoria WHERE nombre_categoria = @categoria;
        IF @id_categoria IS NULL
            THROW 50041, 'Categoría inválida.', 1;

        UPDATE usuario SET id_categoria = @id_categoria WHERE id_usuario = @id_usuario;
        
        SELECT 'Categoría asignada correctamente' AS Mensaje;
    END TRY
    BEGIN CATCH
        DECLARE @ErrorNumber3 INT = ERROR_NUMBER();
        IF @ErrorNumber3 BETWEEN 50040 AND 50049
            THROW;
        ELSE
            THROW 50042, 'Error al asignar categoría.', 1;
    END CATCH
END;
GO


-- 4. Procedimiento para asignar mercados
IF OBJECT_ID('SP_AsignarMercados', 'P') IS NOT NULL
    DROP PROCEDURE SP_AsignarMercados;
GO

CREATE PROCEDURE SP_AsignarMercados
    @id_usuario INT,
    @ids_mercados VARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM usuario WHERE id_usuario = @id_usuario)
            THROW 50050, 'Usuario no existe.', 1;

        -- Eliminar mercados actuales
        DELETE FROM usuario_mercado WHERE id_usuario = @id_usuario;

        -- Insertar nuevos mercados (usando STRING_SPLIT)
        INSERT INTO usuario_mercado (id_usuario, id_mercado)
        SELECT @id_usuario, CAST(value AS INT)
        FROM STRING_SPLIT(@ids_mercados, ',')
        WHERE TRY_CAST(value AS INT) IS NOT NULL
        AND EXISTS (SELECT 1 FROM mercado WHERE id_mercado = CAST(value AS INT));
        
        SELECT 'Mercados asignados correctamente' AS Mensaje;
    END TRY
    BEGIN CATCH
        DECLARE @ErrorNumber4 INT = ERROR_NUMBER();
        IF @ErrorNumber4 BETWEEN 50050 AND 50059
            THROW;
        ELSE
            THROW 50051, 'Error al asignar mercados.', 1;
    END CATCH
END;
GO


-- 5. Procedimiento para crear mercado
IF OBJECT_ID('SP_CrearMercado', 'P') IS NOT NULL
    DROP PROCEDURE SP_CrearMercado;
GO

CREATE PROCEDURE SP_CrearMercado
    @nombre VARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @id_mercado INT;

    BEGIN TRY
        IF LEN(@nombre) < 1 
            THROW 50060, 'Nombre de mercado inválido.', 1;

        INSERT INTO mercado (nombre, estado) VALUES (@nombre, 'habilitado');
        SET @id_mercado = SCOPE_IDENTITY();

        SELECT @id_mercado AS id_mercado_creado;
    END TRY
    BEGIN CATCH
        IF ERROR_NUMBER() = 2627  -- Violación de unique constraint
            THROW 50061, 'El nombre del mercado ya existe.', 1;
        ELSE
            THROW 50062, 'Error al crear mercado.', 1;
    END CATCH
END;
GO


-- Procedimiento para actualizar mercado
IF OBJECT_ID('SP_ActualizarMercado', 'P') IS NOT NULL
    DROP PROCEDURE SP_ActualizarMercado;
GO

CREATE PROCEDURE SP_ActualizarMercado
    @id_mercado INT,
    @nombre VARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM mercado WHERE id_mercado = @id_mercado)
            THROW 50120, 'Mercado no existe.', 1;

        UPDATE mercado SET nombre = @nombre WHERE id_mercado = @id_mercado;
        
        SELECT 'Mercado actualizado correctamente' AS Mensaje;
    END TRY
    BEGIN CATCH
        IF ERROR_NUMBER() = 2627  -- Violación de unique constraint
            THROW 50121, 'El nombre del mercado ya existe.', 1;
        ELSE
            THROW 50122, 'Error al actualizar mercado.', 1;
    END CATCH
END;
GO

-- 6. Procedimiento para eliminar mercado
IF OBJECT_ID('SP_EliminarMercado', 'P') IS NOT NULL
    DROP PROCEDURE SP_EliminarMercado;
GO

CREATE PROCEDURE SP_EliminarMercado
    @id_mercado INT
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        IF EXISTS (SELECT 1 FROM empresa WHERE id_mercado = @id_mercado)
            THROW 50070, 'No se puede eliminar: mercado tiene empresas asociadas.', 1;

        DELETE FROM mercado WHERE id_mercado = @id_mercado;
        
        SELECT 'Mercado eliminado correctamente' AS Mensaje;
    END TRY
    BEGIN CATCH
        THROW 50071, 'Error al eliminar mercado.', 1;
    END CATCH
END;
GO

-- 7. Procedimiento para crear empresa
IF OBJECT_ID('SP_CrearEmpresa', 'P') IS NOT NULL
    DROP PROCEDURE SP_CrearEmpresa;
GO

CREATE PROCEDURE SP_CrearEmpresa
    @id_mercado INT,
    @nombre VARCHAR(100),
    @cantidad_acciones BIGINT,
    @precio_inicial DECIMAL(18,4) = 0
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @id_empresa INT;

    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM mercado WHERE id_mercado = @id_mercado)
            THROW 50080, 'Mercado no existe.', 1;
            
        IF @cantidad_acciones <= 0 
            THROW 50081, 'Cantidad acciones debe ser > 0.', 1;

        INSERT INTO empresa (id_mercado, nombre, precio_actual, cantidad_acciones, activo)
        VALUES (@id_mercado, @nombre, @precio_inicial, @cantidad_acciones, 1);
        SET @id_empresa = SCOPE_IDENTITY();

        -- Inicializar tesoreria
        INSERT INTO tesoreria (id_empresa, acciones_disponibles) 
        VALUES (@id_empresa, @cantidad_acciones);

        SELECT @id_empresa AS id_empresa_creada;
    END TRY
    BEGIN CATCH
        IF ERROR_NUMBER() = 2627
            THROW 50082, 'El nombre de la empresa ya existe.', 1;
        ELSE
            THROW 50083, 'Error al crear empresa.', 1;
    END CATCH
END;
GO

-- 8. Procedimiento para actualizar empresa
IF OBJECT_ID('SP_ActualizarEmpresa', 'P') IS NOT NULL
    DROP PROCEDURE SP_ActualizarEmpresa;
GO

CREATE PROCEDURE SP_ActualizarEmpresa
    @id_empresa INT,
    @nombre VARCHAR(100),
    @cantidad_acciones BIGINT
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM empresa WHERE id_empresa = @id_empresa)
            THROW 50090, 'Empresa no existe.', 1;
            
        IF @cantidad_acciones <= 0 
            THROW 50091, 'Cantidad acciones debe ser > 0.', 1;

        UPDATE empresa 
        SET nombre = @nombre, cantidad_acciones = @cantidad_acciones 
        WHERE id_empresa = @id_empresa;
        
        SELECT 'Empresa actualizada correctamente' AS Mensaje;
    END TRY
    BEGIN CATCH
        IF ERROR_NUMBER() = 2627
            THROW 50092, 'El nombre de la empresa ya existe.', 1;
        ELSE
            THROW 50093, 'Error al actualizar empresa.', 1;
    END CATCH
END;
GO

-- 9. Procedimiento para delistar empresa
IF OBJECT_ID('SP_DelistarEmpresa', 'P') IS NOT NULL
    DROP PROCEDURE SP_DelistarEmpresa;
GO

CREATE PROCEDURE SP_DelistarEmpresa
    @id_empresa INT,
    @justificacion VARCHAR(MAX),  -- Cambiado de TEXT a VARCHAR(MAX)
    @precio_fijo DECIMAL(18,4) = NULL,
    @id_admin INT
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @precio DECIMAL(18,4), @cantidad INT, @id_usuario INT;
    DECLARE @nombre_empresa VARCHAR(100);  -- Variable para almacenar el nombre de la empresa

    BEGIN TRY
        BEGIN TRANSACTION;

        -- Obtener el nombre de la empresa para el log
        SELECT @nombre_empresa = nombre 
        FROM empresa 
        WHERE id_empresa = @id_empresa AND activo = 1;

        IF @nombre_empresa IS NULL
            THROW 50100, 'Empresa no existe o ya está delistada.', 1;

        SET @precio = COALESCE(@precio_fijo, dbo.FN_ObtenerPrecioActual(@id_empresa));

        -- Validar que el precio sea válido
        IF @precio <= 0
            THROW 50102, 'Precio de liquidación inválido.', 1;

        -- Liquidar todos portafolios
        DECLARE cur CURSOR FOR
            SELECT p.id_usuario, p.cantidad
            FROM portafolio p WHERE p.id_empresa = @id_empresa AND p.cantidad > 0;

        OPEN cur;
        FETCH NEXT FROM cur INTO @id_usuario, @cantidad;

        WHILE @@FETCH_STATUS = 0
        BEGIN
            -- Verificar que el usuario existe y está activo
            IF EXISTS (SELECT 1 FROM usuario WHERE id_usuario = @id_usuario AND estado = 1)
            BEGIN
                INSERT INTO transaccion (id_usuario, id_empresa, tipo, cantidad, precio) 
                VALUES (@id_usuario, @id_empresa, 'liquidacion', @cantidad, @precio);
                
                UPDATE w SET saldo = saldo + (@cantidad * @precio) 
                FROM wallet w WHERE w.id_usuario = @id_usuario;
                
                UPDATE p SET cantidad = 0 
                FROM portafolio p 
                WHERE p.id_usuario = @id_usuario AND p.id_empresa = @id_empresa;
                
                UPDATE t SET acciones_disponibles = acciones_disponibles + @cantidad 
                FROM tesoreria t WHERE t.id_empresa = @id_empresa;
            END

            FETCH NEXT FROM cur INTO @id_usuario, @cantidad;
        END;
        CLOSE cur; 
        DEALLOCATE cur;

        -- Delistar
        UPDATE empresa SET activo = 0 WHERE id_empresa = @id_empresa;

        -- Log - Usar VARCHAR(MAX) para la concatenación
        DECLARE @justificacion_completa VARCHAR(MAX);
        SET @justificacion_completa = @justificacion + ' | Empresa: ' + @nombre_empresa + ' (ID: ' + CAST(@id_empresa AS VARCHAR(10)) + ')';

        INSERT INTO evento_admin (id_usuario, id_admin, tipo, justificacion) 
        VALUES (NULL, @id_admin, 'delistar', @justificacion_completa);

        COMMIT TRANSACTION;
        
        SELECT 'Empresa delistada y portafolios liquidados correctamente' AS Mensaje;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
            
        DECLARE @ErrorNumber INT = ERROR_NUMBER();
        IF @ErrorNumber BETWEEN 50100 AND 50109
            THROW;
        ELSE
            THROW 50101, 'Error al delistar empresa.', 1;
    END CATCH
END;
GO


-- 10. Procedimiento para actualizar precio
IF OBJECT_ID('SP_ActualizarPrecio', 'P') IS NOT NULL
    DROP PROCEDURE SP_ActualizarPrecio;
GO

CREATE PROCEDURE SP_ActualizarPrecio
    @id_empresa INT,
    @nuevo_precio DECIMAL(18,4),
    @timestamp DATETIME = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET @timestamp = COALESCE(@timestamp, GETDATE());

    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM empresa WHERE id_empresa = @id_empresa)
            THROW 50110, 'Empresa no existe.', 1;
            
        IF @nuevo_precio <= 0 
            THROW 50111, 'Precio debe ser > 0.', 1;

        -- Histórico
        INSERT INTO historico_precio (id_empresa, precio, fecha) 
        VALUES (@id_empresa, @nuevo_precio, @timestamp);

        -- Actual
        UPDATE empresa SET precio_actual = @nuevo_precio WHERE id_empresa = @id_empresa;
        
        SELECT 'Precio actualizado correctamente' AS Mensaje;
    END TRY
    BEGIN CATCH
        THROW 50112, 'Error al actualizar precio.', 1;
    END CATCH
END;
GO



--  Procedimiento para recargar wallet
IF OBJECT_ID('SP_RecargarWallet', 'P') IS NOT NULL
    DROP PROCEDURE SP_RecargarWallet;
GO

CREATE PROCEDURE SP_RecargarWallet
    @id_usuario INT,
    @monto DECIMAL(18,2)
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @limite_diario DECIMAL(18,2), @recargas_hoy DECIMAL(18,2), @id_wallet INT;

    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM usuario u INNER JOIN wallet w ON u.id_usuario = w.id_usuario WHERE u.id_usuario = @id_usuario AND u.estado = 1)
            THROW 50130, 'Usuario inválido.', 1;
        IF @monto <= 0 
            THROW 50131, 'Monto debe ser > 0.', 1;

        SELECT @id_wallet = id_wallet, @limite_diario = c.limite_diario
        FROM wallet w
        INNER JOIN usuario u ON w.id_usuario = u.id_usuario
        INNER JOIN categoria c ON u.id_categoria = c.id_categoria
        WHERE w.id_usuario = @id_usuario;

        SET @recargas_hoy = dbo.FN_GetDailyRechargeUsed(@id_usuario);
        IF (@recargas_hoy + @monto) > @limite_diario
            THROW 50132, 'Excede límite diario de recarga.', 1;

        -- Insertar y actualizar
        INSERT INTO recarga (id_wallet, monto) VALUES (@id_wallet, @monto);
        UPDATE wallet SET saldo = saldo + @monto WHERE id_wallet = @id_wallet;

        SELECT 'Recarga realizada correctamente' AS Mensaje;
    END TRY
    BEGIN CATCH
        DECLARE @ErrorNumber1 INT = ERROR_NUMBER();
        IF @ErrorNumber1 BETWEEN 50130 AND 50139
            THROW;
        ELSE
            THROW 50133, 'Error al recargar wallet.', 1;
    END CATCH
END;
GO

--  Procedimiento para comprar acciones
IF OBJECT_ID('SP_ComprarAcciones', 'P') IS NOT NULL
    DROP PROCEDURE SP_ComprarAcciones;
GO

CREATE PROCEDURE SP_ComprarAcciones
    @id_usuario INT,
    @id_empresa INT,
    @cantidad INT
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @precio DECIMAL(18,4), @costo_total DECIMAL(18,2), @max_buyable BIGINT, @id_mercado INT,
            @cantidad_existente INT, @costo_promedio_existente DECIMAL(18,4), @nuevo_costo_promedio DECIMAL(18,4),
            @id_wallet INT, @id_portafolio INT;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- Validaciones
        IF NOT EXISTS (SELECT 1 FROM usuario WHERE id_usuario = @id_usuario AND estado = 1 AND id_rol IN (SELECT id_rol FROM rol WHERE nombre_rol = 'Trader'))
            THROW 50140, 'Usuario inválido o no Trader.', 1;
        IF NOT EXISTS (SELECT 1 FROM empresa e WHERE e.id_empresa = @id_empresa AND e.activo = 1)
            THROW 50141, 'Empresa inválida.', 1;
        IF @cantidad <= 0 
            THROW 50142, 'Cantidad debe ser > 0.', 1;

        -- Mercado habilitado
        SELECT @id_mercado = id_mercado FROM empresa WHERE id_empresa = @id_empresa;
        IF NOT EXISTS (SELECT 1 FROM usuario_mercado WHERE id_usuario = @id_usuario AND id_mercado = @id_mercado)
            THROW 50143, 'Mercado no habilitado para el usuario.', 1;

        SET @precio = dbo.FN_ObtenerPrecioActual(@id_empresa);
        SET @max_buyable = dbo.FN_GetMaxBuyableShares(@id_usuario, @id_empresa);
        IF @max_buyable < 0
            THROW 50144, 'Error al verificar acciones comprables.', 1;
        IF @cantidad > @max_buyable 
            THROW 50145, 'Cantidad excede máximo buyable (saldo/tesoreria).', 1;

        SET @costo_total = @cantidad * @precio;
        SELECT @id_wallet = id_wallet FROM wallet WHERE id_usuario = @id_usuario;

        -- Actualizar wallet
        UPDATE wallet SET saldo = saldo - @costo_total WHERE id_wallet = @id_wallet;

        -- UPSERT portafolio (costo promedio ponderado)
        SELECT @cantidad_existente = cantidad, @costo_promedio_existente = costo_promedio, @id_portafolio = id_portafolio
        FROM portafolio WHERE id_usuario = @id_usuario AND id_empresa = @id_empresa;

        IF @@ROWCOUNT > 0
        BEGIN
            SET @nuevo_costo_promedio = ((@cantidad_existente * @costo_promedio_existente) + @costo_total) / (@cantidad_existente + @cantidad);
            UPDATE portafolio
            SET cantidad = cantidad + @cantidad, costo_promedio = @nuevo_costo_promedio, id_mercado = @id_mercado
            WHERE id_portafolio = @id_portafolio;
        END
        ELSE
        BEGIN
            INSERT INTO portafolio (id_usuario, id_empresa, id_mercado, cantidad, costo_promedio)
            VALUES (@id_usuario, @id_empresa, @id_mercado, @cantidad, @precio);
        END;

        -- Tesoreria -
        UPDATE tesoreria SET acciones_disponibles = acciones_disponibles - @cantidad WHERE id_empresa = @id_empresa;

        -- Log
        INSERT INTO transaccion (id_usuario, id_empresa, tipo, cantidad, precio) 
        VALUES (@id_usuario, @id_empresa, 'compra', @cantidad, @precio);

        COMMIT TRANSACTION;
        
        SELECT 'Compra realizada correctamente' AS Mensaje;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
            
        DECLARE @ErrorNumber2 INT = ERROR_NUMBER();
        IF @ErrorNumber2 BETWEEN 50140 AND 50149
            THROW;
        ELSE
            THROW 50146, 'Error al comprar acciones.', 1;
    END CATCH
END;
GO

--  Procedimiento para vender acciones
IF OBJECT_ID('SP_VenderAcciones', 'P') IS NOT NULL
    DROP PROCEDURE SP_VenderAcciones;
GO

CREATE PROCEDURE SP_VenderAcciones
    @id_usuario INT,
    @id_empresa INT,
    @cantidad INT
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @precio DECIMAL(18,4), @monto_venta DECIMAL(18,2), @cantidad_disponible INT, @id_mercado INT, @id_wallet INT;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- Validaciones similares
        IF NOT EXISTS (SELECT 1 FROM usuario WHERE id_usuario = @id_usuario AND estado = 1)
            THROW 50150, 'Usuario inválido.', 1;
        IF NOT EXISTS (SELECT 1 FROM empresa e WHERE e.id_empresa = @id_empresa AND e.activo = 1)
            THROW 50151, 'Empresa inválida.', 1;
        IF @cantidad <= 0 
            THROW 50152, 'Cantidad debe ser > 0.', 1;

        SELECT @id_mercado = id_mercado FROM empresa WHERE id_empresa = @id_empresa;
        IF NOT EXISTS (SELECT 1 FROM usuario_mercado WHERE id_usuario = @id_usuario AND id_mercado = @id_mercado)
            THROW 50153, 'Mercado no habilitado.', 1;

        SET @precio = dbo.FN_ObtenerPrecioActual(@id_empresa);
        SELECT @cantidad_disponible = cantidad FROM portafolio WHERE id_usuario = @id_usuario AND id_empresa = @id_empresa;
        IF @cantidad > ISNULL(@cantidad_disponible, 0) 
            THROW 50154, 'Posición insuficiente.', 1;

        SET @monto_venta = @cantidad * @precio;
        SELECT @id_wallet = id_wallet FROM wallet WHERE id_usuario = @id_usuario;

        -- Actualizar
        UPDATE wallet SET saldo = saldo + @monto_venta WHERE id_wallet = @id_wallet;
        UPDATE portafolio SET cantidad = cantidad - @cantidad WHERE id_usuario = @id_usuario AND id_empresa = @id_empresa;
        
        -- Eliminar si la cantidad llega a 0
        IF (SELECT cantidad FROM portafolio WHERE id_usuario = @id_usuario AND id_empresa = @id_empresa) = 0
            DELETE FROM portafolio WHERE id_usuario = @id_usuario AND id_empresa = @id_empresa;

        UPDATE tesoreria SET acciones_disponibles = acciones_disponibles + @cantidad WHERE id_empresa = @id_empresa;

        -- Log
        INSERT INTO transaccion (id_usuario, id_empresa, tipo, cantidad, precio) 
        VALUES (@id_usuario, @id_empresa, 'venta', @cantidad, @precio);

        COMMIT TRANSACTION;
        
        SELECT 'Venta realizada correctamente' AS Mensaje;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
            
        DECLARE @ErrorNumber3 INT = ERROR_NUMBER();
        IF @ErrorNumber3 BETWEEN 50150 AND 50159
            THROW;
        ELSE
            THROW 50155, 'Error al vender acciones.', 1;
    END CATCH
END;
GO

--  Procedimiento para liquidar todo
IF OBJECT_ID('SP_LiquidarTodo', 'P') IS NOT NULL
    DROP PROCEDURE SP_LiquidarTodo;
GO

CREATE PROCEDURE SP_LiquidarTodo
    @id_usuario INT
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @id_empresa INT, @cantidad INT, @precio DECIMAL(18,4), @id_mercado INT, @id_wallet INT;

    BEGIN TRY
        BEGIN TRANSACTION;

        IF NOT EXISTS (SELECT 1 FROM usuario WHERE id_usuario = @id_usuario AND estado = 1)
            THROW 50160, 'Usuario inválido.', 1;

        SELECT @id_wallet = id_wallet FROM wallet WHERE id_usuario = @id_usuario;

        DECLARE cur CURSOR FOR
            SELECT p.id_empresa, p.cantidad, p.id_mercado
            FROM portafolio p
            INNER JOIN empresa e ON p.id_empresa = e.id_empresa
            WHERE p.id_usuario = @id_usuario AND e.activo = 1;

        OPEN cur;
        FETCH NEXT FROM cur INTO @id_empresa, @cantidad, @id_mercado;

        WHILE @@FETCH_STATUS = 0
        BEGIN
            SET @precio = dbo.FN_ObtenerPrecioActual(@id_empresa);
            DECLARE @monto DECIMAL(18,2) = @cantidad * @precio;

            -- Vender
            UPDATE wallet SET saldo = saldo + @monto WHERE id_wallet = @id_wallet;
            DELETE FROM portafolio WHERE id_usuario = @id_usuario AND id_empresa = @id_empresa;
            UPDATE tesoreria SET acciones_disponibles = acciones_disponibles + @cantidad WHERE id_empresa = @id_empresa;

            -- Log
            INSERT INTO transaccion (id_usuario, id_empresa, tipo, cantidad, precio) 
            VALUES (@id_usuario, @id_empresa, 'liquidacion', @cantidad, @precio);

            FETCH NEXT FROM cur INTO @id_empresa, @cantidad, @id_mercado;
        END;
        CLOSE cur; 
        DEALLOCATE cur;

        COMMIT TRANSACTION;
        
        SELECT 'Liquidación completada correctamente' AS Mensaje;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
            
        DECLARE @ErrorNumber4 INT = ERROR_NUMBER();
        IF @ErrorNumber4 BETWEEN 50160 AND 50169
            THROW;
        ELSE
            THROW 50161, 'Error al liquidar todo.', 1;
    END CATCH
END;
GO

